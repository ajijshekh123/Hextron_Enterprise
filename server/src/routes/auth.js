import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

const setupAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Administrator password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required')
  })
});

/**
 * POST /api/v1/auth/login
 * Authenticates user and issues JWT token
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user = null;

    if (isLiveDb && prisma) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { employee: true }
      });
    } else {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (user && user.employeeId) {
        const emp = memoryStore.employees.find((e) => e.id === user.employeeId);
        user = { ...user, employee: emp };
      }
    }

    if (!user) {
      throw new AppError('Invalid credentials. Please verify your email and password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled. Please contact the administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials. Please verify your email and password.', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Update lastLoginAt
    const now = new Date();
    if (isLiveDb && prisma) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now }
      });
    } else {
      user.lastLoginAt = now;
    }

    // Return sanitized response (never return passwordHash)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employee: user.employee ? {
            id: user.employee.id,
            fullName: user.employee.fullName,
            designation: user.employee.designation,
            department: user.employee.department,
            employeeCode: user.employee.employeeCode
          } : null
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/me
 * Retrieves currently authenticated user session
 */
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * POST /api/v1/auth/logout
 * Handles client-side session cleanup
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /api/v1/auth/setup-admin
 * Initializes the first administrator if database has no users
 */
router.post('/setup-admin', validate(setupAdminSchema), async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let userCount = 0;
    if (isLiveDb && prisma) {
      userCount = await prisma.user.count();
    } else {
      userCount = memoryStore.users.length;
    }

    if (userCount > 0) {
      throw new AppError('Initial administrator setup is disabled because users already exist.', 403);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;
    if (isLiveDb && prisma) {
      const emp = await prisma.employee.create({
        data: {
          employeeCode: 'EMP-001',
          fullName,
          workEmail: normalizedEmail,
          phone: '+91 9879964414',
          department: 'Executive Administration',
          designation: 'System Administrator'
        }
      });

      newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'ADMIN',
          employeeId: emp.id
        },
        include: { employee: true }
      });
    } else {
      const empId = `emp_${Date.now()}`;
      const emp = {
        id: empId,
        employeeCode: 'EMP-001',
        fullName,
        workEmail: normalizedEmail,
        phone: '+91 9879964414',
        department: 'Executive Administration',
        designation: 'System Administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.employees.push(emp);

      newUser = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        employeeId: empId,
        employee: emp,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.users.push(newUser);
    }

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'Initial administrator created successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
