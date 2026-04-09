import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { ScanService } from '../services/scan.service';



const scanService = new ScanService();

export class ScanController {
  async createScan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { type, target } = req.body;
      const result = await scanService.createScan(userId, type, target);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await scanService.getScanResult(id, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {

      next(error);
    }
  }

  async listScans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const scans = await prisma.scan.findMany({

        where: { userId },
        include: { result: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ success: true, data: scans });
    } catch (error) {
      next(error);
    }
  }
}
