import { AppError } from './errorHandler.js';

/**
 * Enforces role-based permissions on protected endpoints
 * @param  {...string} allowedRoles Roles permitted to access (e.g. 'ADMIN', 'SALES', 'EMPLOYEE')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User context not found. Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' lacks sufficient privileges for this operation.`,
          403
        )
      );
    }

    next();
  };
}
