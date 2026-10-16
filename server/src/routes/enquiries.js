import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { publicSubmissionLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

// Validation Schemas
const publicEnquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    companyName: z.string().optional().nullable(),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(8, 'Phone number must be at least 8 digits'),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters')
  })
});

const updateEnquirySchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED']).optional(),
    assignedEmployeeId: z.string().optional().nullable(),
    followUpDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable()
  })
});

const addEnquiryNoteSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Note content is required')
  })
});

/**
 * POST /api/v1/enquiries/public
 * Public Contact Us form submission with rate limiting and anti-spam
 */
router.post('/public', publicSubmissionLimiter, validate(publicEnquirySchema), async (req, res, next) => {
  try {
    const { name, companyName, email, phone, subject, message } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let createdEnquiry = null;

    if (isLiveDb && prisma) {
      // Find or create customer entry
      let customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            fullName: name,
            companyName: companyName || null,
            email: normalizedEmail,
            phone
          }
        });
      }

      createdEnquiry = await prisma.contactEnquiry.create({
        data: {
          name,
          companyName: companyName || null,
          email: normalizedEmail,
          phone,
          subject,
          message,
          status: 'NEW',
          customerId: customer.id
        }
      });
    } else {
      let customer = memoryStore.customers.find((c) => c.email.toLowerCase() === normalizedEmail);
      if (!customer) {
        customer = {
          id: `cust_${Date.now()}`,
          fullName: name,
          companyName: companyName || null,
          email: normalizedEmail,
          phone,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryStore.customers.push(customer);
      }

      createdEnquiry = {
        id: `enq_${Date.now()}`,
        name,
        companyName: companyName || null,
        email: normalizedEmail,
        phone,
        subject,
        message,
        status: 'NEW',
        assignedEmployeeId: null,
        customerId: customer.id,
        followUpDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.contactEnquiries.push(createdEnquiry);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will review your specifications and contact you shortly.',
      data: {
        id: createdEnquiry.id,
        status: createdEnquiry.status,
        timestamp: createdEnquiry.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/enquiries
 * List enquiries with status filter, search, and pagination (Staff only)
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let enquiries = [];
    let totalCount = 0;

    if (isLiveDb && prisma) {
      const where = {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      [enquiries, totalCount] = await Promise.all([
        prisma.contactEnquiry.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedEmployee: true,
            customer: true
          }
        }),
        prisma.contactEnquiry.count({ where })
      ]);
    } else {
      let filtered = [...memoryStore.contactEnquiries];

      if (status && status !== 'ALL') {
        filtered = filtered.filter((e) => e.status === status);
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            (e.companyName && e.companyName.toLowerCase().includes(s)) ||
            e.email.toLowerCase().includes(s) ||
            e.subject.toLowerCase().includes(s) ||
            e.message.toLowerCase().includes(s)
        );
      }

      totalCount = filtered.length;
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      enquiries = filtered.slice(skip, skip + limitNum).map((e) => {
        const emp = memoryStore.employees.find((emp) => emp.id === e.assignedEmployeeId);
        const cust = memoryStore.customers.find((c) => c.id === e.customerId);
        return { ...e, assignedEmployee: emp || null, customer: cust || null };
      });
    }

    res.json({
      success: true,
      data: {
        enquiries,
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
 * GET /api/v1/enquiries/:id
 * Retrieve single enquiry with internal notes
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    let enquiry = null;

    if (isLiveDb && prisma) {
      enquiry = await prisma.contactEnquiry.findUnique({
        where: { id },
        include: {
          assignedEmployee: true,
          customer: true,
          internalNotes: { orderBy: { createdAt: 'desc' } }
        }
      });
    } else {
      const e = memoryStore.contactEnquiries.find((item) => item.id === id);
      if (e) {
        const emp = memoryStore.employees.find((emp) => emp.id === e.assignedEmployeeId);
        const cust = memoryStore.customers.find((c) => c.id === e.customerId);
        const notes = memoryStore.internalNotes
          .filter((n) => n.enquiryId === e.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        enquiry = { ...e, assignedEmployee: emp || null, customer: cust || null, internalNotes: notes };
      }
    }

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    res.json({
      success: true,
      data: { enquiry }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/enquiries/:id
 * Update enquiry status, assigned staff, or follow-up date (ADMIN, SALES)
 */
router.patch('/:id', authenticateToken, requireRole('ADMIN', 'SALES'), validate(updateEnquirySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedEmployeeId, followUpDate } = req.body;

    let updated = null;

    if (isLiveDb && prisma) {
      const data = {};
      if (status !== undefined) data.status = status;
      if (assignedEmployeeId !== undefined) data.assignedEmployeeId = assignedEmployeeId;
      if (followUpDate !== undefined) {
        data.followUpDate = followUpDate ? new Date(followUpDate) : null;
      }

      updated = await prisma.contactEnquiry.update({
        where: { id },
        data,
        include: { assignedEmployee: true }
      });
    } else {
      const e = memoryStore.contactEnquiries.find((item) => item.id === id);
      if (!e) throw new AppError('Enquiry not found', 404);

      if (status !== undefined) e.status = status;
      if (assignedEmployeeId !== undefined) e.assignedEmployeeId = assignedEmployeeId;
      if (followUpDate !== undefined) {
        e.followUpDate = followUpDate ? new Date(followUpDate) : null;
      }
      e.updatedAt = new Date();

      const emp = memoryStore.employees.find((emp) => emp.id === e.assignedEmployeeId);
      updated = { ...e, assignedEmployee: emp || null };
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: { enquiry: updated }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/enquiries/:id/notes
 * Add internal note to contact enquiry
 */
router.post('/:id/notes', authenticateToken, validate(addEnquiryNoteSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const authorName = req.user.employee?.fullName || req.user.email;

    if (isLiveDb && prisma) {
      const createdNote = await prisma.internalNote.create({
        data: {
          enquiryId: id,
          authorId: req.user.id,
          authorName,
          note
        }
      });
      res.status(201).json({ success: true, data: { note: createdNote } });
    } else {
      const newNote = {
        id: `not_${Date.now()}`,
        quotationId: null,
        enquiryId: id,
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

export default router;
