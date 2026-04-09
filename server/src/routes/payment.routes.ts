import { Router } from 'express';
import { z } from 'zod';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const paymentController = new PaymentController();

const paySchema = z.object({
  body: z.object({
    scanId: z.string().uuid('Invalid scan ID'),
    amount: z.number().positive('Amount must be a positive number'),
    transactionHash: z.string().min(1, 'Transaction hash is required for verification'),
  }),
});

// GET /api/pay/intent/:scanId -> Create x402 payment intent
router.get('/intent/:scanId', authenticate, paymentController.getPaymentIntent);

// POST /api/pay -> Verify & confirm payment
router.post('/', authenticate, validate(paySchema), paymentController.pay);

// GET /api/pay/transactions -> List user transactions
router.get('/transactions', authenticate, paymentController.getTransactions);

export default router;

