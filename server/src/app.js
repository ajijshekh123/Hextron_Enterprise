import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import quotationsRouter from './routes/quotations.js';
import enquiriesRouter from './routes/enquiries.js';
import employeesRouter from './routes/employees.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import usersRouter from './routes/users.js';
import settingsRouter from './routes/settings.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and requests without origin (e.g. mobile or server-to-server)
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === config.corsOrigin) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev/staging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter on API routes
app.use('/api', generalLimiter);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    service: 'Hextron Enterprises REST API v1'
  });
});

// Versioned API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/quotations', quotationsRouter);
app.use('/api/v1/enquiries', enquiriesRouter);
app.use('/api/v1/employees', employeesRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/settings', settingsRouter);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint '${req.originalUrl}' not found. Check documentation for supported v1 routes.`,
      statusCode: 404
    }
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
