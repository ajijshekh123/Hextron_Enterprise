import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name is required'),
    slug: z.string().optional(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    displayOrder: z.number().int().default(0)
  })
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().optional(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
});

/**
 * GET /api/v1/categories
 * Public endpoint: returns active categories for public website navigation and filter
 */
router.get('/', async (req, res, next) => {
  try {
    if (isLiveDb && prisma) {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: { where: { isActive: true, isPublic: true } } }
          }
        }
      });
      res.json({ success: true, data: { categories } });
    } else {
      const categories = memoryStore.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((c) => {
          const productCount = memoryStore.products.filter(
            (p) => p.categoryId === c.id && p.isActive && p.isPublic
          ).length;
          return { ...c, _count: { products: productCount } };
        });
      res.json({ success: true, data: { categories } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/categories/admin
 * Admin endpoint: returns all categories with management details (ADMIN, SALES)
 */
router.get('/admin', authenticateToken, async (req, res, next) => {
  try {
    if (isLiveDb && prisma) {
      const categories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { products: true } }
        }
      });
      res.json({ success: true, data: { categories } });
    } else {
      const categories = [...memoryStore.categories]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((c) => {
          const productCount = memoryStore.products.filter((p) => p.categoryId === c.id).length;
          return { ...c, _count: { products: productCount } };
        });
      res.json({ success: true, data: { categories } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/categories
 * Create new category (ADMIN only)
 */
router.post('/', authenticateToken, requireRole('ADMIN'), validate(createCategorySchema), async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl, displayOrder } = req.body;
    const finalSlug = slug ? slugify(slug) : slugify(name);

    if (isLiveDb && prisma) {
      const existing = await prisma.category.findFirst({
        where: {
          OR: [{ name }, { slug: finalSlug }]
        }
      });
      if (existing) {
        throw new AppError('A category with this name or slug already exists', 400);
      }

      const created = await prisma.category.create({
        data: {
          name,
          slug: finalSlug,
          description,
          imageUrl,
          displayOrder: displayOrder || 0,
          isActive: true
        }
      });
      res.status(201).json({ success: true, message: 'Category created successfully', data: { category: created } });
    } else {
      const existing = memoryStore.categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === finalSlug
      );
      if (existing) {
        throw new AppError('A category with this name or slug already exists', 400);
      }

      const newCat = {
        id: `cat_${Date.now()}`,
        name,
        slug: finalSlug,
        description,
        imageUrl,
        displayOrder: displayOrder || 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.categories.push(newCat);
      res.status(201).json({ success: true, message: 'Category created successfully', data: { category: newCat } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/categories/:id
 * Update category details (ADMIN only)
 */
router.put('/:id', authenticateToken, requireRole('ADMIN'), validate(updateCategorySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.slug) {
      updates.slug = slugify(updates.slug);
    } else if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name);
    }

    if (isLiveDb && prisma) {
      const updated = await prisma.category.update({
        where: { id },
        data: updates
      });
      res.json({ success: true, message: 'Category updated successfully', data: { category: updated } });
    } else {
      const cat = memoryStore.categories.find((c) => c.id === id);
      if (!cat) throw new AppError('Category not found', 404);

      Object.assign(cat, updates, { updatedAt: new Date() });
      res.json({ success: true, message: 'Category updated successfully', data: { category: cat } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/categories/:id/status
 * Toggle active/inactive status (ADMIN only)
 */
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isLiveDb && prisma) {
      const cat = await prisma.category.findUnique({ where: { id } });
      if (!cat) throw new AppError('Category not found', 404);

      const updated = await prisma.category.update({
        where: { id },
        data: { isActive: !cat.isActive }
      });
      res.json({
        success: true,
        message: `Category is now ${updated.isActive ? 'Active' : 'Inactive'}`,
        data: { category: updated }
      });
    } else {
      const cat = memoryStore.categories.find((c) => c.id === id);
      if (!cat) throw new AppError('Category not found', 404);

      cat.isActive = !cat.isActive;
      cat.updatedAt = new Date();
      res.json({
        success: true,
        message: `Category is now ${cat.isActive ? 'Active' : 'Inactive'}`,
        data: { category: cat }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/categories/:id
 * Delete category with safety constraint check (prevent deletion if products assigned)
 */
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isLiveDb && prisma) {
      const productCount = await prisma.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        throw new AppError(
          `Cannot delete category: ${productCount} products are currently assigned to it. Reassign or delete products first.`,
          400
        );
      }

      await prisma.category.delete({ where: { id } });
      res.json({ success: true, message: 'Category deleted successfully' });
    } else {
      const productCount = memoryStore.products.filter((p) => p.categoryId === id).length;
      if (productCount > 0) {
        throw new AppError(
          `Cannot delete category: ${productCount} products are currently assigned to it. Reassign or delete products first.`,
          400
        );
      }

      const index = memoryStore.categories.findIndex((c) => c.id === id);
      if (index === -1) throw new AppError('Category not found', 404);
      memoryStore.categories.splice(index, 1);
      res.json({ success: true, message: 'Category deleted successfully' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
