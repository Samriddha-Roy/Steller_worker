import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { BadRequestError } from '../utils/errors';
import { Keypair } from '@stellar/stellar-sdk';

export class AuthService {
  async register(email: string, passwordRaw: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestError('User already exists');
    }

    const password = await bcrypt.hash(passwordRaw, 10);
    
    // Create new Stellar mock keypair
    const pair = Keypair.random();

    const user = await prisma.user.create({
      data: {
        email,
        password,
        balance: 1000, // Give them 1000 credits for hackathon demo
        wallets: {
          create: {
            publicKey: pair.publicKey(),
            secretKey: pair.secret(),
          }
        }
      },
    });

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance,
      },
      token
    };
  }

  async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(passwordRaw, user.password);
    if (!isValid) {
      throw new BadRequestError('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance,
      },
      token
    };
  }

  private generateToken(id: string) {
    return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '1d' });
  }
}
