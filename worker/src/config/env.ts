import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  OPENAI_API_KEY: z.string().optional().default('MISSING_KEY_MOCK_MODE'),
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

  // DEBUG: Print all available env keys to see what Render is actually providing
  const availableKeys = Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NODE_'));
  console.log("\n📡 Debug: Available Environment Variable Keys in this process:");
  console.log(availableKeys.join(', '));
  
  throw new Error('Missing DATABASE_URL or REDIS_URL. Service cannot start.');
}

export const env = envParsed.data;

if (env.OPENAI_API_KEY === 'MISSING_KEY_MOCK_MODE') {
  console.warn("\n⚠️  [WARNING] OPENAI_API_KEY is missing! Service is starting in MOCK MODE.");
  console.warn("💡 Scans will work, but AI analysis will use high-quality fallback data.");
}
