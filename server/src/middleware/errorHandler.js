export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';

  // Do not expose stack trace or database internals in production
  const response = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  if (err.errors) {
    response.error.details = err.errors;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  console.error(`[API Error] [${req.method} ${req.originalUrl}] - ${statusCode}: ${message}`);
  res.status(statusCode).json(response);
}

export class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
