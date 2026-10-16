import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

const createEmployeeSchema = z.object({
  body: z.object({
    employeeCode: z.string().min(2, 'Employee code is required (e.g. EMP-005)'),
    fullName: z.string().min(2, 'Full name is required'),
    workEmail: z.string().email('Please enter a valid work email address'),
    phone: z.string().min(8, 'Phone number is required'),
    department: z.string().min(2, 'Department is required'),
    designation: z.string().min(2, 'Designation is required'),
    joiningDate: z.string().optional().nullable()
  })
});

const updateEmployeeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    workEmail: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    department: z.string().min(2).optional(),
    designation: z.string().min(2).optional(),
    joiningDate: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  })
});

/**
 * GET /api/v1/employees
 * List all employees with search & department filters (Authenticated staff)
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { department, active, search } = req.query;

    if (isLiveDb && prisma) {
      const where = {
        ...(department && department !== 'ALL' ? { department } : {}),
        ...(active !== undefined ? { isActive: active === 'true' } : {}),
        ...(search ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
            { workEmail: { contains: search, mode: 'insensitive' } },
            { department: { contains: search, mode: 'insensitive' } },
            { designation: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const employees = await prisma.employee.findMany({
        where,
        orderBy: { employeeCode: 'asc' }
      });

      res.json({ success: true, data: { employees } });
    } else {
      let filtered = [...memoryStore.employees];

      if (department && department !== 'ALL') {
        filtered = filtered.filter((e) => e.department === department);
      }
      if (active !== undefined) {
        filtered = filtered.filter((e) => e.isActive === (active === 'true'));
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.fullName.toLowerCase().includes(s) ||
            e.employeeCode.toLowerCase().includes(s) ||
            e.workEmail.toLowerCase().includes(s) ||
            e.department.toLowerCase().includes(s) ||
            e.designation.toLowerCase().includes(s)
        );
      }

      filtered.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
      res.json({ success: true, data: { employees: filtered } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/employees/:id
 * Retrieve employee profile
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    let employee = null;

    if (isLiveDb && prisma) {
      employee = await prisma.employee.findUnique({
        where: { id }
      });
    } else {
      employee = memoryStore.employees.find((e) => e.id === id);
    }

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.json({ success: true, data: { employee } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/employees
 * Create new employee profile (ADMIN only)
 */
router.post('/', authenticateToken, requireRole('ADMIN'), validate(createEmployeeSchema), async (req, res, next) => {
  try {
    const { employeeCode, fullName, workEmail, phone, department, designation, joiningDate } = req.body;
    const normalizedEmail = workEmail.toLowerCase().trim();

    if (isLiveDb && prisma) {
      const existing = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeCode },
            { workEmail: normalizedEmail }
          ]
        }
      });
      if (existing) {
        throw new AppError('Employee with this code or email already exists', 400);
      }

      const created = await prisma.employee.create({
        data: {
          employeeCode,
          fullName,
          workEmail: normalizedEmail,
          phone,
          department,
          designation,
          joiningDate: joiningDate ? new Date(joiningDate) : null,
          isActive: true
        }
      });

      res.status(201).json({ success: true, message: 'Employee added successfully', data: { employee: created } });
    } else {
      const existing = memoryStore.employees.find(
        (e) => e.employeeCode.toLowerCase() === employeeCode.toLowerCase() || e.workEmail.toLowerCase() === normalizedEmail
      );
      if (existing) {
        throw new AppError('Employee with this code or email already exists', 400);
      }

      const newEmp = {
        id: `emp_${Date.now()}`,
        employeeCode,
        fullName,
        workEmail: normalizedEmail,
        phone,
        department,
        designation,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.employees.push(newEmp);

      res.status(201).json({ success: true, message: 'Employee added successfully', data: { employee: newEmp } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/employees/:id
 * Update employee profile (ADMIN only)
 */
router.put('/:id', authenticateToken, requireRole('ADMIN'), validate(updateEmployeeSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.workEmail) {
      updates.workEmail = updates.workEmail.toLowerCase().trim();
    }
    if (updates.joiningDate) {
      updates.joiningDate = new Date(updates.joiningDate);
    }

    if (isLiveDb && prisma) {
      const updated = await prisma.employee.update({
        where: { id },
        data: updates
      });
      res.json({ success: true, message: 'Employee updated successfully', data: { employee: updated } });
    } else {
      const emp = memoryStore.employees.find((e) => e.id === id);
      if (!emp) throw new AppError('Employee not found', 404);

      Object.assign(emp, updates, { updatedAt: new Date() });
      res.json({ success: true, message: 'Employee updated successfully', data: { employee: emp } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/employees/:id/status
 * Toggle active/inactive status (ADMIN only)
 */
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isLiveDb && prisma) {
      const emp = await prisma.employee.findUnique({ where: { id } });
      if (!emp) throw new AppError('Employee not found', 404);

      const updated = await prisma.employee.update({
        where: { id },
        data: { isActive: !emp.isActive }
      });
      res.json({
        success: true,
        message: `Employee status set to ${updated.isActive ? 'Active' : 'Inactive'}`,
        data: { employee: updated }
      });
    } else {
      const emp = memoryStore.employees.find((e) => e.id === id);
      if (!emp) throw new AppError('Employee not found', 404);

      emp.isActive = !emp.isActive;
      emp.updatedAt = new Date();
      res.json({
        success: true,
        message: `Employee status set to ${emp.isActive ? 'Active' : 'Inactive'}`,
        data: { employee: emp }
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
