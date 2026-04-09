import { prisma } from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { ScanService } from './scan.service';
import { StellarService } from './stellar.service';

const scanService = new ScanService();
const stellarService = new StellarService();

export class PaymentService {
  /**
   * Prepares a payment intent for a scan
   */
  async getPaymentIntent(userId: string, scanId: string) {
    const scan = await prisma.scan.findFirst({
      where: { id: scanId, userId },
    });

    if (!scan) throw new NotFoundError('Scan not found');
    if (scan.paymentStatus === 'paid') throw new BadRequestError('Scan already paid');

    return await stellarService.createPaymentIntent(scanId, scan.cost);
  }

  /**
   * Completes a payment after receiving a Stellar transaction hash
   */
  async payForScan(userId: string, scanId: string, amount: number, transactionHash: string) {
    // 1. Verify payment on Stellar (mock)
    const verification = await stellarService.verifyPayment(transactionHash);
    if (!verification.success) {
      throw new BadRequestError('Stellar transaction verification failed');
    }

    // Wrap in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify user exists
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('User not found');

      // 2. Verify scan exists and needs payment
      const scan = await tx.scan.findFirst({
        where: { id: scanId, userId },
      });

      if (!scan) throw new NotFoundError('Scan not found');
      if (scan.paymentStatus === 'paid') throw new BadRequestError('Scan already paid');
      if (Math.abs(scan.cost - amount) > 0.01) {
        throw new BadRequestError(`Payment amount ${amount} does not match scan cost ${scan.cost}`);
      }
      
      // We simulate record keeping without blocking on internal balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: 0 } }, 
      });

      // 3. Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          scanId,
          amount,
          status: 'success',
        },
      });

      // 4. Mark Scan as Paid
      await tx.scan.update({
        where: { id: scanId },
        data: { paymentStatus: 'paid' },
      });

      return transaction;
    });


    // Fire off async background job for scanning since payment is successful
    // We don't "await" it here to avoid hanging the HTTP response if Redis is slow.
    // The payment is already recorded in the DB, so we can always retry manually.
    scanService.processScanAfterPayment(scanId).catch(err => {
      console.error('[PaymentService] Failed to queue scan job:', err.message);
    });

    return {
      transaction: result,
      stellarHash: verification.hash,
      message: 'Payment verified and scan queued.'
    };

  }
}

