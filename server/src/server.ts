import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { redis } from './config/redis';

// Import worker to start processing jobs in the same process (for MVP)
// In production, move this to a separate process
// import './jobs/worker';

const PORT = parseInt(env.PORT, 10);

async function start() {
  try {
    // Validate DB connection
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔑 Auth routes:  http://localhost:${PORT}/api/auth`);
      console.log(`🔍 Scan routes:  http://localhost:${PORT}/api/scan`);
      console.log(`💳 Pay routes:   http://localhost:${PORT}/api/pay`);
      console.log(`\n📡 System: Running in API-only mode (Standalone Worker required)\n`);
    });
  } catch (error: any) {
    console.error('\n❌ [Server] Failed to start!');
    console.error(`Reason: ${error.message}`);
    if (error.message.includes('Can\'t reach database server')) {
      console.error('💡 Tip: Check if your DATABASE_URL allows connections from Render\'s IP range or if SSL is required.');
    }
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
