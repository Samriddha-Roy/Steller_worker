import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../config/redis';

export const scanQueueName = 'scan-queue';

export const scanQueue = new Queue(scanQueueName, {
  connection: redis,
});

export const scanQueueEvents = new QueueEvents(scanQueueName, {
  connection: redis,
});

export const addScanJob = async (scanId: string, type: string, target: string) => {
  try {
    console.log(`[Queue] Adding job for scan ${scanId}...`);
    const job = await scanQueue.add('start-scan', {
      scanId,
      type,
      target,
    });
    console.log(`✅ [Queue] Job added successfully: ${job.id}`);
  } catch (error: any) {
    console.error(`❌ [Queue] Failed to add job: ${error.message}`);
    throw error;
  }
};

