import { Worker } from 'bullmq';
import { redis } from './config/redis';
import { processScan } from './jobs/scan.job';
import dotenv from 'dotenv';

dotenv.config();

console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🔍 AI HACKER SECURITY WORKER SERVICE      ║
║   Status: ONLINE                             ║
║   Queue: scan-queue                          ║
║                                              ║
╚══════════════════════════════════════════════╝
`);

const worker = new Worker('scan-queue', processScan, {
  connection: redis,
  concurrency: 5, // Process up to 5 scans simultaneously
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Shutting down...');
  await worker.close();
  process.exit(0);
});
