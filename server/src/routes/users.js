import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'SALES', 'EMPLOYEE']),
    employeeId: z.string().optional().nullable()
  })
});

const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'SALES', 'EMPLOYEE']).optional(),
    isActive: z.boolean().optional(),
    employeeId: z.string().optional().nullable()
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
  })
});

/**
 * GET /api/v1/users
 * List all users with linked employee profiles (ADMIN only)
 */
router.get('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    if (isLiveDb && prisma) {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          employeeId: true,
          employee: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      });
      res.json({ success: true, data: { users } });
    } else {
      const users = memoryStore.users.map((u) => {
        const emp = u.employeeId ? memoryStore.employees.find((e) => e.id === u.employeeId) : null;
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          employeeId: u.employeeId,
          employee: emp,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        };
      });
      res.json({ success: true, data: { users } });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/users
 * Create user account with assigned role (ADMIN only)
 */
router.post('/', authenticateToken, requireRole('ADMIN'), validate(createUserSchema), async (req, res, next) => {
  try {
    const { email, password, role, employeeId } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isLiveDb && prisma) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) throw new AppError('User with this email already exists', 400);

      const created = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role,
          employeeId: employeeId || null,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          employeeId: true,
          createdAt: true
        }
      });

      res.status(201).json({ success: true, message: 'User created successfully', data: { user: created } });
    } else {
      const existing = memoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existing) throw new AppError('User with this email already exists', 400);

      const newUser = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        passwordHash,
        role,
        employeeId: employeeId || null,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.users.push(newUser);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            employeeId: newUser.employeeId,
            createdAt: newUser.createdAt
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/users/:id
 * Update user role, active status, or employee link (ADMIN only)
 */
router.put('/:id', authenticateToken, requireRole('ADMIN'), validate(updateUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive, employeeId } = req.body;

    if (id === req.user.id && isActive === false) {
      throw new AppError('Administrators cannot deactivate their own active account', 400);
    }

    if (isLiveDb && prisma) {
      const data = {};
      if (role !== undefined) data.role = role;
      if (isActive !== undefined) data.isActive = isActive;
      if (employeeId !== undefined) data.employeeId = employeeId;

      const updated = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          employeeId: true,
          updatedAt: true
        }
      });

      res.json({ success: true, message: 'User updated successfully', data: { user: updated } });
    } else {
      const user = memoryStore.users.find((u) => u.id === id);
      if (!user) throw new AppError('User not found', 404);

      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (employeeId !== undefined) user.employeeId = employeeId;
      user.updatedAt = new Date();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            employeeId: user.employeeId,
            updatedAt: user.updatedAt
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/users/:id/reset-password
 * Reset password for a user (ADMIN only)
 */
router.post('/:id/reset-password', authenticateToken, requireRole('ADMIN'), validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    if (isLiveDb && prisma) {
      await prisma.user.update({
        where: { id },
        data: { passwordHash }
      });
    } else {
      const user = memoryStore.users.find((u) => u.id === id);
      if (!user) throw new AppError('User not found', 404);
      user.passwordHash = passwordHash;
      user.updatedAt = new Date();
    }

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
