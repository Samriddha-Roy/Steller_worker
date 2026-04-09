import { Job } from 'bullmq';
import { prisma } from '../config/db';
import { WebScanner } from '../scanners/webScanner';
import { RepoScanner } from '../scanners/repoScanner';
import { AiAnalysisService } from '../ai/analyze';

const webScanner = new WebScanner();
const repoScanner = new RepoScanner();
const aiService = new AiAnalysisService();

export async function processScan(job: Job) {
  const { scanId, type, target } = job.data;
  
  console.log(`\n[Job:${job.id}] 🚀 Starting scan process for ${target}...`);

  try {
    // 1. Update status to running
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'running' },
    });

    let rawOutput = '';

    // 2. Execute corresponding scanner
    if (type === 'url') {
      rawOutput = await webScanner.scan(target);
    } else if (type === 'github') {
      rawOutput = await repoScanner.scan(target);
    } else {
      throw new Error(`Invalid scan type: ${type}`);
    }

    // 3. Perform AI analysis
    console.log(`[Job:${job.id}] 🤖 Tool output gathered. Running AI analysis...`);
    const analysis = await aiService.analyzeToolOutput(target, type === 'url' ? 'OWASP ZAP' : 'Semgrep', rawOutput);

    // 4. Store results in DB
    console.log(`[Job:${job.id}] 📦 Analysis complete. Saving results...`);
    await prisma.scanResult.create({
      data: {
        scanId,
        rawOutput,
        vulnerabilities: analysis.vulnerabilities,
        severity: analysis.overallSeverity,
        aiSuggestions: analysis.aiSuggestions,
        fixes: analysis.fixes,
      },
    });

    // 5. Mark scan as completed
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'completed' },
    });

    console.log(`[Job:${job.id}] ✅ Scan completed successfully!\n`);
  } catch (error: any) {
    console.error(`[Job:${job.id}] ❌ Scan failed:`, error.message);
    
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'failed' },
    });
    
    throw error;
  }
}
