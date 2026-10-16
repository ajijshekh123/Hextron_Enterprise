import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(2, 'SKU or product code is required'),
    name: z.string().min(2, 'Product name is required'),
    description: z.string().min(5, 'Description is required'),
    categoryId: z.string().min(1, 'Category is required'),
    material: z.string().min(1, 'Material specification is required'),
    specifications: z.string().or(z.record(z.any())).optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    isPublic: z.boolean().default(true)
  })
});

const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    categoryId: z.string().optional(),
    material: z.string().optional(),
    specifications: z.string().or(z.record(z.any())).optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional()
  })
});

/**
 * GET /api/v1/products
 * Public Product Catalog with search, category filtering, and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, material, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (isLiveDb && prisma) {
      const where = {
        isActive: true,
        isPublic: true,
        ...(category && category !== 'ALL' ? {
          OR: [
            { categoryId: category },
            { category: { slug: category } }
          ]
        } : {}),
        ...(material && material !== 'ALL' ? { material: { contains: material, mode: 'insensitive' } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { material: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: { category: true }
        }),
        prisma.product.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } else {
      let filtered = memoryStore.products.filter((p) => p.isActive && p.isPublic);

      if (category && category !== 'ALL') {
        const cat = memoryStore.categories.find((c) => c.id === category || c.slug === category);
        if (cat) {
          filtered = filtered.filter((p) => p.categoryId === cat.id);
        }
      }

      if (material && material !== 'ALL') {
        filtered = filtered.filter((p) => p.material.toLowerCase().includes(material.toLowerCase()));
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.material.toLowerCase().includes(s)
        );
      }

      const total = filtered.length;
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = filtered.slice(skip, skip + limitNum).map((p) => {
        const cat = memoryStore.categories.find((c) => c.id === p.categoryId);
        return { ...p, category: cat || null };
      });

      res.json({
        success: true,
        data: {
          products: paginated,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/products/admin/all
 * Staff listing of all products with full status (ADMIN, SALES, EMPLOYEE)
 */
router.get('/admin/all', authenticateToken, async (req, res, next) => {
  try {
    const { category, search, active } = req.query;

    if (isLiveDb && prisma) {
      const where = {
        ...(category && category !== 'ALL' ? { categoryId: category } : {}),
        ...(active !== undefined ? { isActive: active === 'true' } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { material: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      });

      res.json({ success: true, data: { products } });
    } else {
      let filtered = [...memoryStore.products];

      if (category && category !== 'ALL') {
        filtered = filtered.filter((p) => p.categoryId === category);
      }
      if (active !== undefined) {
        filtered = filtered.filter((p) => p.isActive === (active === 'true'));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.material.toLowerCase().includes(s)
        );
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const products = filtered.map((p) => {
        const cat = memoryStore.categories.find((c) => c.id === p.categoryId);
        return { ...p, category: cat || null };
      });

      res.json({ success: true, data: { products } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/products/:id
 * Single product detail view (Public)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (isLiveDb && prisma) {
      product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { sku: id }]
        },
        include: { category: true }
      });
    } else {
      const p = memoryStore.products.find((item) => item.id === id || item.sku.toLowerCase() === id.toLowerCase());
      if (p) {
        const cat = memoryStore.categories.find((c) => c.id === p.categoryId);
        product = { ...p, category: cat || null };
      }
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/products
 * Create product (ADMIN, SALES)
 */
router.post('/', authenticateToken, requireRole('ADMIN', 'SALES'), validate(createProductSchema), async (req, res, next) => {
  try {
    const { sku, name, description, categoryId, material, specifications, imageUrl, isActive, isPublic } = req.body;
    const cleanSku = sku.toUpperCase().trim();
    const specsString = typeof specifications === 'object' && specifications !== null
      ? JSON.stringify(specifications)
      : specifications;

    if (isLiveDb && prisma) {
      const existing = await prisma.product.findUnique({ where: { sku: cleanSku } });
      if (existing) throw new AppError('Product with this SKU already exists', 400);

      const created = await prisma.product.create({
        data: {
          sku: cleanSku,
          name,
          description,
          categoryId,
          material,
          specifications: specsString,
          imageUrl: imageUrl || '/images/gallery/gallery-1.jpg',
          isActive: isActive !== undefined ? isActive : true,
          isPublic: isPublic !== undefined ? isPublic : true
        },
        include: { category: true }
      });

      res.status(201).json({ success: true, message: 'Product added successfully', data: { product: created } });
    } else {
      const existing = memoryStore.products.find((p) => p.sku.toUpperCase() === cleanSku);
      if (existing) throw new AppError('Product with this SKU already exists', 400);

      const newProduct = {
        id: `prd_${Date.now()}`,
        sku: cleanSku,
        name,
        description,
        categoryId,
        material,
        specifications: specsString,
        imageUrl: imageUrl || '/images/gallery/gallery-1.jpg',
        isActive: isActive !== undefined ? isActive : true,
        isPublic: isPublic !== undefined ? isPublic : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.products.push(newProduct);
      const cat = memoryStore.categories.find((c) => c.id === categoryId);

      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        data: { product: { ...newProduct, category: cat || null } }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/products/:id
 * Update product (ADMIN, SALES)
 */
router.put('/:id', authenticateToken, requireRole('ADMIN', 'SALES'), validate(updateProductSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.sku) updates.sku = updates.sku.toUpperCase().trim();
    if (typeof updates.specifications === 'object' && updates.specifications !== null) {
      updates.specifications = JSON.stringify(updates.specifications);
    }

    if (isLiveDb && prisma) {
      const updated = await prisma.product.update({
        where: { id },
        data: updates,
        include: { category: true }
      });
      res.json({ success: true, message: 'Product updated successfully', data: { product: updated } });
    } else {
      const prod = memoryStore.products.find((p) => p.id === id);
      if (!prod) throw new AppError('Product not found', 404);

      Object.assign(prod, updates, { updatedAt: new Date() });
      const cat = memoryStore.categories.find((c) => c.id === prod.categoryId);
      res.json({ success: true, message: 'Product updated successfully', data: { product: { ...prod, category: cat || null } } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/products/:id
 * Delete product (ADMIN only)
 */
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isLiveDb && prisma) {
      await prisma.product.delete({ where: { id } });
    } else {
      const idx = memoryStore.products.findIndex((p) => p.id === id);
      if (idx === -1) throw new AppError('Product not found', 404);
      memoryStore.products.splice(idx, 1);
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
