import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

/**
 * General API rate limiter (protects all API routes)
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      statusCode: 429
    }
  }
});

/**
 * Strict rate limiter for Authentication endpoints (prevents brute-force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      statusCode: 429
    }
  }
});

/**
 * Public Submission Rate Limiter (Quote Request & Contact Form spam protection)
 */
export const publicSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 submissions per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Submission limit reached. Please wait a few minutes before submitting another request.',
      statusCode: 429
    }
  }
});
