import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const redisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(0),
  REDIS_KEY_PREFIX: z.string().default('merpy:auth:'),
});

export type RedisConfig = z.infer<typeof redisConfigSchema>;

export default registerAs('redis', (): RedisConfig => {
  const parsed = redisConfigSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Redis config validation error: ${parsed.error.message}`);
  }

  return parsed.data;
});
