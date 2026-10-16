import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session expired. Please log in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    // Retrieve active user from database or memory fallback
    let user = null;
    if (isLiveDb && prisma) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { employee: true }
      });
    } else {
      user = memoryStore.users.find((u) => u.id === decoded.userId);
      if (user && user.employeeId) {
        const emp = memoryStore.employees.find((e) => e.id === user.employeeId);
        user = { ...user, employee: emp };
      }
    }

    if (!user) {
      throw new AppError('Authenticated user no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account has been deactivated. Please contact an administrator.', 403);
    }

    // Attach sanitized user context
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      employee: user.employee ? {
        id: user.employee.id,
        fullName: user.employee.fullName,
        designation: user.employee.designation,
        department: user.employee.department,
        employeeCode: user.employee.employeeCode
      } : null
    };

    next();
  } catch (err) {
    next(err);
  }
}
