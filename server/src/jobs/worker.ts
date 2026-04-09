import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/db';
import { AiService } from '../services/ai.service';
import { S3Service } from '../services/s3.service';

const aiService = new AiService();
const s3Service = new S3Service();

export const scanWorker = new Worker(
  'scan-queue',
  async (job: Job) => {
    const { scanId, type, target } = job.data;

    // Update scan status to running
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'running' },
    });

    console.log(`[Worker] Started scan ${scanId} for target ${target} (${type})`);

    try {
      // Simulate scanning time based on type
      const scanTime = type === 'github' ? 8000 : 5000;
      await new Promise(res => setTimeout(res, scanTime));

      let rawOutput = '';
      if (type === 'github') {
        rawOutput = `[Semgrep Analysis Report for ${target}]
Vulnerability 1: Hardcoded secret (AWS_ACCESS_KEY) found in src/config/aws.js:14
Vulnerability 2: Broken Access Control - No auth middleware on /admin/delete-user endpoint
Vulnerability 3: Potential RCE - Unvalidated input in child_process.exec() at src/utils/shell.ts:42
Vulnerability 4: Dependency check - Found outdated library 'minimist' with known prototype pollution.`;
      } else {
        rawOutput = `[OWASP ZAP Dynamic Scan Report for ${target}]
Alert 1: SQL Injection found on parameter 'id' at /api/products/details
Alert 2: Cross-Site Scripting (Reflected) on search parameter 'q'
Alert 3: Missing Security Headers - X-Frame-Options, CSP not set
Alert 4: Insecure Cookie - 'session' cookie missing Secure and HttpOnly flags.`;
      }

      // Send to AI for structured analysis
      console.log(`[Worker] Sending data to AI for analysis...`);
      const aiResult = await aiService.analyzeVulnerabilities(target, rawOutput);

      // Upload report to S3 (Mock)
      const reportUrl = await s3Service.uploadReport(scanId, {
        target,
        type,
        timestamp: new Date().toISOString(),
        rawOutput,
        aiAnalysis: aiResult
      });

      // Create Scan Result
      const scanResult = await prisma.scanResult.create({
        data: {
          scanId,
          rawOutput,
          vulnerabilities: aiResult.vulnerabilities,
          severity: aiResult.overallSeverity,
          aiSuggestions: aiResult.aiSuggestions,
          fixes: aiResult.fixes,
        },
      });

      // Update scan to completed
      await prisma.scan.update({
        where: { id: scanId },
        data: {
          status: 'completed',
        },
      });

      console.log(`[Worker] Completed scan ${scanId}. Report URL: ${reportUrl}`);
    } catch (error) {
      console.error(`[Worker] Failed scan ${scanId}`, error);
      await prisma.scan.update({
        where: { id: scanId },
        data: { status: 'failed' },
      });
      throw error;
    }
  },
  {
    connection: redis,
  }
);


scanWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});
