import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { publicSubmissionLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateQuotationTotals, generateQuotationNumber, roundToTwo } from '../utils/calc.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

// Validation Schemas
const publicQuoteSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    companyName: z.string().min(2, 'Company name is required'),
    email: z.string().email('Valid email address is required'),
    phone: z.string().min(8, 'Phone number must be at least 8 digits'),
    serviceType: z.string().default('CNC Turning Job Work'),
    material: z.string().min(2, 'Material specification is required'),
    quantity: z.string().or(z.number()),
    requirements: z.string().min(5, 'Please provide component specifications or job details'),
    drawingRef: z.string().optional().nullable()
  })
});

const quotationItemSchema = z.object({
  partName: z.string().min(1, 'Part name is required'),
  description: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().default('PCS'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  specifications: z.string().optional().nullable()
});

const staffCreateQuoteSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    companyName: z.string().min(2, 'Company name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(8, 'Phone number is required'),
    componentName: z.string().min(2, 'Component name is required'),
    description: z.string().optional().nullable(),
    materialType: z.string().min(1, 'Material type is required'),
    quantity: z.number().positive().default(1),
    unitPrice: z.number().nonnegative().default(0),
    discountPercent: z.number().min(0).max(100).default(0),
    taxRate: z.number().nonnegative().default(18),
    estimatedDelivery: z.string().optional().nullable(),
    assignedEmployeeId: z.string().optional().nullable(),
    drawingRef: z.string().optional().nullable(),
    items: z.array(quotationItemSchema).optional()
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CLOSED']),
    remarks: z.string().optional().default('')
  })
});

const addNoteSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Note content is required')
  })
});

/**
 * Generate safe unique quotation number
 */
async function getNextQuotationNumber() {
  const year = new Date().getFullYear();
  let count = 0;
  if (isLiveDb && prisma) {
    count = await prisma.quotation.count();
  } else {
    count = memoryStore.quotations.length;
  }
  return generateQuotationNumber(count + 1, year);
}

/**
 * POST /api/v1/quotations/public
 * Public quotation request from corporate website (Rate Limited)
 */
router.post('/public', publicSubmissionLimiter, validate(publicQuoteSchema), async (req, res, next) => {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      serviceType,
      material,
      quantity,
      requirements,
      drawingRef
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const quotationNumber = await getNextQuotationNumber();

    // Parse numeric quantity if given as string e.g. "500" or "Small Batch (10 - 100 pcs)" -> default 50
    let numericQty = 50;
    if (typeof quantity === 'number') {
      numericQty = quantity;
    } else {
      const match = String(quantity).match(/\d+/);
      if (match) numericQty = parseInt(match[0], 10);
    }

    const totals = calculateQuotationTotals({
      items: [],
      quantity: numericQty,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 18.0
    });

    let createdQuotation = null;

    if (isLiveDb && prisma) {
      // Find or create customer
      let customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            fullName,
            companyName,
            email: normalizedEmail,
            phone
          }
        });
      }

      createdQuotation = await prisma.quotation.create({
        data: {
          quotationNumber,
          customerId: customer.id,
          customerName: fullName,
          companyName,
          email: normalizedEmail,
          phone,
          componentName: `${serviceType} - ${material}`,
          description: requirements,
          materialType: material,
          quantity: numericQty,
          drawingRef: drawingRef || null,
          status: 'NEW',
          unitPrice: 0.00,
          discountPercent: 0.00,
          discountAmount: 0.00,
          taxRate: 18.00,
          taxAmount: 0.00,
          subtotal: 0.00,
          grandTotal: 0.00,
          estimatedDelivery: 'Subject to drawing evaluation',
          items: {
            create: [
              {
                itemOrder: 1,
                partName: `${serviceType} - Custom Component`,
                description: requirements,
                material,
                quantity: numericQty,
                unit: 'PCS',
                unitPrice: 0.00,
                total: 0.00
              }
            ]
          },
          history: {
            create: [
              {
                previousStatus: 'NEW',
                newStatus: 'NEW',
                changedByName: 'Public Website Portal',
                remarks: `Quotation request submitted online by ${fullName} (${companyName}).`
              }
            ]
          }
        }
      });
    } else {
      // Memory Store fallback
      let customer = memoryStore.customers.find((c) => c.email.toLowerCase() === normalizedEmail);
      if (!customer) {
        customer = {
          id: `cust_${Date.now()}`,
          fullName,
          companyName,
          email: normalizedEmail,
          phone,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryStore.customers.push(customer);
      }

      const qId = `qt_${Date.now()}`;
      createdQuotation = {
        id: qId,
        quotationNumber,
        customerId: customer.id,
        customerName: fullName,
        companyName,
        email: normalizedEmail,
        phone,
        componentName: `${serviceType} - ${material}`,
        description: requirements,
        materialType: material,
        quantity: numericQty,
        drawingRef: drawingRef || null,
        status: 'NEW',
        unitPrice: 0.00,
        discountPercent: 0.00,
        discountAmount: 0.00,
        taxRate: 18.00,
        taxAmount: 0.00,
        subtotal: 0.00,
        grandTotal: 0.00,
        estimatedDelivery: 'Subject to drawing evaluation',
        assignedEmployeeId: null,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryStore.quotations.push(createdQuotation);

      // Line item
      memoryStore.quotationItems.push({
        id: `qti_${Date.now()}`,
        quotationId: qId,
        itemOrder: 1,
        partName: `${serviceType} - Custom Component`,
        description: requirements,
        material,
        quantity: numericQty,
        unit: 'PCS',
        unitPrice: 0.00,
        total: 0.00,
        specifications: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // History log
      memoryStore.quotationHistory.push({
        id: `qth_${Date.now()}`,
        quotationId: qId,
        previousStatus: 'NEW',
        newStatus: 'NEW',
        changedById: null,
        changedByName: 'Public Website Portal',
        remarks: `Quotation request submitted online by ${fullName} (${companyName}).`,
        createdAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully. Our engineering team will review your specifications.',
      data: {
        quotationNumber: createdQuotation.quotationNumber,
        status: createdQuotation.status,
        customerName: fullName,
        companyName
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/quotations
 * List quotations with search, status filters, and pagination (Staff only)
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, search, archived = 'false', page = 1, limit = 20 } = req.query;
    const isArchived = archived === 'true';
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let quotations = [];
    let totalCount = 0;

    if (isLiveDb && prisma) {
      const where = {
        isArchived,
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(search ? {
          OR: [
            { quotationNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { componentName: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      [quotations, totalCount] = await Promise.all([
        prisma.quotation.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedEmployee: true,
            items: true
          }
        }),
        prisma.quotation.count({ where })
      ]);
    } else {
      let filtered = memoryStore.quotations.filter((q) => q.isArchived === isArchived);

      if (status && status !== 'ALL') {
        filtered = filtered.filter((q) => q.status === status);
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (q) =>
            q.quotationNumber.toLowerCase().includes(s) ||
            q.customerName.toLowerCase().includes(s) ||
            q.companyName.toLowerCase().includes(s) ||
            q.email.toLowerCase().includes(s) ||
            q.componentName.toLowerCase().includes(s)
        );
      }

      totalCount = filtered.length;
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      quotations = filtered.slice(skip, skip + limitNum).map((q) => {
        const emp = memoryStore.employees.find((e) => e.id === q.assignedEmployeeId);
        const items = memoryStore.quotationItems.filter((i) => i.quotationId === q.id);
        return { ...q, assignedEmployee: emp || null, items };
      });
    }

    res.json({
      success: true,
      data: {
        quotations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/quotations/:id
 * Retrieve single quotation details with items, history, and internal notes
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    let quotation = null;

    if (isLiveDb && prisma) {
      quotation = await prisma.quotation.findUnique({
        where: { id },
        include: {
          customer: true,
          assignedEmployee: true,
          items: { orderBy: { itemOrder: 'asc' } },
          history: { orderBy: { createdAt: 'desc' } },
          internalNotes: { orderBy: { createdAt: 'desc' } }
        }
      });
    } else {
      const q = memoryStore.quotations.find((item) => item.id === id || item.quotationNumber === id);
      if (q) {
        const customer = memoryStore.customers.find((c) => c.id === q.customerId);
        const assignedEmployee = memoryStore.employees.find((e) => e.id === q.assignedEmployeeId);
        const items = memoryStore.quotationItems.filter((i) => i.quotationId === q.id);
        const history = memoryStore.quotationHistory
          .filter((h) => h.quotationId === q.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const internalNotes = memoryStore.internalNotes
          .filter((n) => n.quotationId === q.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        quotation = { ...q, customer, assignedEmployee, items, history, internalNotes };
      }
    }

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    res.json({
      success: true,
      data: { quotation }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/quotations
 * Staff manual creation of full quotation with multi-line items (ADMIN, SALES)
 */
router.post('/', authenticateToken, requireRole('ADMIN', 'SALES'), validate(staffCreateQuoteSchema), async (req, res, next) => {
  try {
    const {
      customerName,
      companyName,
      email,
      phone,
      componentName,
      description,
      materialType,
      quantity,
      unitPrice,
      discountPercent,
      taxRate,
      estimatedDelivery,
      assignedEmployeeId,
      drawingRef,
      items = []
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const quotationNumber = await getNextQuotationNumber();

    // Prepare line items
    let lineItems = items;
    if (!lineItems || lineItems.length === 0) {
      lineItems = [
        {
          partName: componentName,
          description: description || 'Precision CNC Machined Component',
          material: materialType,
          quantity: quantity || 1,
          unit: 'PCS',
          unitPrice: unitPrice || 0,
          specifications: null
        }
      ];
    }

    // Decimal-safe financial totals
    const totals = calculateQuotationTotals({
      items: lineItems,
      discountPercent,
      taxRate
    });

    let createdQuotation = null;

    if (isLiveDb && prisma) {
      // Find or create customer
      let customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { fullName: customerName, companyName, email: normalizedEmail, phone }
        });
      }

      createdQuotation = await prisma.quotation.create({
        data: {
          quotationNumber,
          customerId: customer.id,
          customerName,
          companyName,
          email: normalizedEmail,
          phone,
          componentName,
          description,
          materialType,
          quantity: roundToTwo(quantity || 1),
          drawingRef: drawingRef || null,
          status: 'UNDER_REVIEW',
          unitPrice: roundToTwo(unitPrice || 0),
          discountPercent: roundToTwo(totals.discountPercent),
          discountAmount: roundToTwo(totals.discountAmount),
          taxRate: roundToTwo(totals.taxRate),
          taxAmount: roundToTwo(totals.taxAmount),
          subtotal: roundToTwo(totals.subtotal),
          grandTotal: roundToTwo(totals.grandTotal),
          estimatedDelivery: estimatedDelivery || '7 - 10 working days',
          assignedEmployeeId: assignedEmployeeId || null,
          items: {
            create: lineItems.map((item, idx) => ({
              itemOrder: idx + 1,
              partName: item.partName,
              description: item.description,
              material: item.material,
              quantity: roundToTwo(item.quantity),
              unit: item.unit || 'PCS',
              unitPrice: roundToTwo(item.unitPrice),
              total: roundToTwo(item.quantity * item.unitPrice),
              specifications: item.specifications
            }))
          },
          history: {
            create: [
              {
                previousStatus: 'NEW',
                newStatus: 'UNDER_REVIEW',
                changedById: req.user.id,
                changedByName: req.user.employee?.fullName || req.user.email,
                remarks: 'Quotation draft created and placed under technical review.'
              }
            ]
          }
        },
        include: { items: true, history: true }
      });
    } else {
      const qId = `qt_${Date.now()}`;
      createdQuotation = {
        id: qId,
        quotationNumber,
        customerId: null,
        customerName,
        companyName,
        email: normalizedEmail,
        phone,
        componentName,
        description,
        materialType,
        quantity: roundToTwo(quantity || 1),
        drawingRef: drawingRef || null,
        status: 'UNDER_REVIEW',
        unitPrice: roundToTwo(unitPrice || 0),
        discountPercent: roundToTwo(totals.discountPercent),
        discountAmount: roundToTwo(totals.discountAmount),
        taxRate: roundToTwo(totals.taxRate),
        taxAmount: roundToTwo(totals.taxAmount),
        subtotal: roundToTwo(totals.subtotal),
        grandTotal: roundToTwo(totals.grandTotal),
        estimatedDelivery: estimatedDelivery || '7 - 10 working days',
        assignedEmployeeId: assignedEmployeeId || null,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryStore.quotations.push(createdQuotation);

      const createdItems = lineItems.map((item, idx) => {
        const itemObj = {
          id: `qti_${Date.now()}_${idx}`,
          quotationId: qId,
          itemOrder: idx + 1,
          partName: item.partName,
          description: item.description,
          material: item.material,
          quantity: roundToTwo(item.quantity),
          unit: item.unit || 'PCS',
          unitPrice: roundToTwo(item.unitPrice),
          total: roundToTwo(item.quantity * item.unitPrice),
          specifications: item.specifications,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryStore.quotationItems.push(itemObj);
        return itemObj;
      });

      memoryStore.quotationHistory.push({
        id: `qth_${Date.now()}`,
        quotationId: qId,
        previousStatus: 'NEW',
        newStatus: 'UNDER_REVIEW',
        changedById: req.user.id,
        changedByName: req.user.employee?.fullName || req.user.email,
        remarks: 'Quotation draft created and placed under technical review.',
        createdAt: new Date()
      });

      createdQuotation.items = createdItems;
    }

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: { quotation: createdQuotation }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/quotations/:id/status
 * Transition quotation status and log in audit history (ADMIN, SALES)
 */
router.patch('/:id/status', authenticateToken, requireRole('ADMIN', 'SALES'), validate(updateStatusSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus, remarks } = req.body;

    let quotation = null;

    if (isLiveDb && prisma) {
      quotation = await prisma.quotation.findUnique({ where: { id } });
      if (!quotation) throw new AppError('Quotation not found', 404);

      const previousStatus = quotation.status;
      if (previousStatus === newStatus) {
        return res.json({ success: true, message: 'Status is already set to ' + newStatus });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedQ = await tx.quotation.update({
          where: { id },
          data: { status: newStatus }
        });

        await tx.quotationHistory.create({
          data: {
            quotationId: id,
            previousStatus,
            newStatus,
            changedById: req.user.id,
            changedByName: req.user.employee?.fullName || req.user.email,
            remarks: remarks || `Status transitioned from ${previousStatus} to ${newStatus}.`
          }
        });

        return updatedQ;
      });

      return res.json({
        success: true,
        message: `Quotation status updated to ${newStatus}`,
        data: { quotation: updated }
      });
    } else {
      quotation = memoryStore.quotations.find((q) => q.id === id);
      if (!quotation) throw new AppError('Quotation not found', 404);

      const previousStatus = quotation.status;
      quotation.status = newStatus;
      quotation.updatedAt = new Date();

      memoryStore.quotationHistory.push({
        id: `qth_${Date.now()}`,
        quotationId: id,
        previousStatus,
        newStatus,
        changedById: req.user.id,
        changedByName: req.user.employee?.fullName || req.user.email,
        remarks: remarks || `Status transitioned from ${previousStatus} to ${newStatus}.`,
        createdAt: new Date()
      });

      return res.json({
        success: true,
        message: `Quotation status updated to ${newStatus}`,
        data: { quotation }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/quotations/:id/notes
 * Append internal note to quotation
 */
router.post('/:id/notes', authenticateToken, validate(addNoteSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const authorName = req.user.employee?.fullName || req.user.email;

    if (isLiveDb && prisma) {
      const createdNote = await prisma.internalNote.create({
        data: {
          quotationId: id,
          authorId: req.user.id,
          authorName,
          note
        }
      });
      res.status(201).json({ success: true, data: { note: createdNote } });
    } else {
      const newNote = {
        id: `not_${Date.now()}`,
        quotationId: id,
        enquiryId: null,
        authorId: req.user.id,
        authorName,
        note,
        createdAt: new Date()
      };
      memoryStore.internalNotes.push(newNote);
      res.status(201).json({ success: true, data: { note: newNote } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/quotations/:id
 * Archive / delete quotation (ADMIN only)
 */
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isLiveDb && prisma) {
      await prisma.quotation.update({
        where: { id },
        data: { isArchived: true }
      });
    } else {
      const q = memoryStore.quotations.find((item) => item.id === id);
      if (!q) throw new AppError('Quotation not found', 404);
      q.isArchived = true;
    }

    res.json({ success: true, message: 'Quotation archived successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
