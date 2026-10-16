import app from './app.js';
import { config } from './config/index.js';
import { testDbConnection } from './lib/prisma.js';

async function startServer() {
  // Test DB connection (checks PostgreSQL or activates in-memory resilience)
  await testDbConnection();

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Hextron Enterprises REST API Server`);
    console.log(`   Running on: http://localhost:${config.port}`);
    console.log(`   API v1 Base: http://localhost:${config.port}/api/v1`);
    console.log(`   Health Check: http://localhost:${config.port}/api/v1/health`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`====================================================`);
  });

  const gracefulShutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
