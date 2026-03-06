import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default(5000),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  API_PREFIX: z.string().default('api'),
  API_VERSION: z.string().default('1'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default registerAs('app', (): AppConfig => {
  const parsed = appConfigSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`App config validation error: ${parsed.error.message}`);
  }

  return parsed.data;
});
