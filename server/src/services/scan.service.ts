import { prisma } from '../config/db';
import { addScanJob } from '../queue/queue';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { GithubService } from './github.service';

const githubService = new GithubService();

export class ScanService {
  async createScan(userId: string, type: 'url' | 'github', target: string) {
    let cost = 5; // Base cost

    // Validate target
    if (type === 'github') {
      const repoInfo = await githubService.getRepoInfo(target);
      if (!repoInfo) {
        throw new BadRequestError('Invalid or inaccessible GitHub repository');
      }
      // Bonus: Dynamic cost based on repo stars (more stars = more "valuable" scan)
      if (repoInfo.stars > 1000) cost = 15;
      else if (repoInfo.stars > 100) cost = 10;
    }

    // Create the scan in pending status. Payment will be required to start actual processing.
    const scan = await prisma.scan.create({

      data: {
        userId,
        type,
        target,
        cost,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    });

    return { 
      scanId: scan.id, 
      cost: scan.cost,
      message: 'Scan created. Please proceed to payment to start the analysis.'
    };
  }


  async processScanAfterPayment(scanId: string) {
    const scan = await prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) throw new NotFoundError('Scan not found');
    if (scan.paymentStatus !== 'paid') throw new BadRequestError('Scan is not paid yet');

    await addScanJob(scan.id, scan.type, scan.target);
  }

  async getScanResult(scanId: string, userId: string) {
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId: userId,
      },
      include: {
        result: true,
      },
    });

    if (!scan) {
      throw new NotFoundError('Scan not found or unauthorized');
    }

    return scan;
  }
}
