import { Router } from 'express';
import { z } from 'zod';
import { ScanController } from '../controllers/scan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const scanController = new ScanController();

const createScanSchema = z.object({
  body: z.object({
    type: z.enum(['url', 'github'], { message: 'Type must be "url" or "github"' }),

    target: z.string().min(1, 'Target is required').refine((val) => {
      // If it's a URL, cool. If it's github but just owner/repo, also cool.
      if (val.startsWith('http')) {
        try { new URL(val); return true; } catch { return false; }
      }
      return val.includes('/'); // Basic check for owner/repo
    }, { message: 'Target must be a valid URL or owner/repo path' }),
  }),
});


// POST /scan
router.post('/', authenticate, validate(createScanSchema), scanController.createScan);

// GET /scan  (list all scans for user)
router.get('/', authenticate, scanController.listScans);

// GET /results/:id -> scan results
// When mounted at /api/results in app.ts, this becomes GET /api/results/:id
router.get('/:id', authenticate, scanController.getResult);


export default router;
