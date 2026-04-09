import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  async getPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const scanId = req.params.scanId as string;
      const intent = await paymentService.getPaymentIntent(userId, scanId);
      res.status(200).json({ success: true, data: intent });
    } catch (error) {
      next(error);
    }
  }

  async pay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { scanId, amount, transactionHash } = req.body;
      const result = await paymentService.payForScan(userId, scanId, amount, transactionHash);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }
}


