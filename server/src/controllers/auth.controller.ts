import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthService } from '../services/auth.service';


const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({

        where: { id: userId },
        select: { id: true, email: true, balance: true, createdAt: true, wallets: { select: { publicKey: true } } },
      });
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
