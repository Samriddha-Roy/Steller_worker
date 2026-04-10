import { PrismaClient } from '@prisma/client';
import './env'; // Ensure env vars are validated

export const prisma = new PrismaClient();
