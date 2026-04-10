import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  STELLAR_SECRET_KEY: z.string(),
});

// Pre-process env variables to remove literal quotes if they were pasted accidentally (e.g. on Render)
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    typeof value === 'string' ? value.replace(/^["']|["']$/g, '').trim() : value
  ])
);

const envParsed = envSchema.safeParse(cleanEnv);

if (!envParsed.success) {
  console.error("❌ Invalid environment variables:");
  const fieldErrors = envParsed.error.flatten().fieldErrors;
  
  for (const [field, errors] of Object.entries(fieldErrors)) {
    console.error(`   - ${field}: ${errors?.join(', ')}`);
  }
  
  throw new Error('Invalid environment variables. Please check your Render dashboard.');
}

export const env = envParsed.data;
