import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  OPENAI_API_KEY: z.string(),
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
  console.error("❌ Worker: Invalid environment variables:");
  const fieldErrors = envParsed.error.flatten().fieldErrors;
  
  for (const [field, errors] of Object.entries(fieldErrors)) {
    console.error(`   - ${field}: ${errors?.join(', ')}`);
  }
  
  // For background workers on Render, we want it to fail clearly in logs
  console.error("\n💡 Tip: Check the 'Environment' tab in your Render Background Worker settings.");
  throw new Error('Invalid environment variables. Service cannot start.');
}

export const env = envParsed.data;
