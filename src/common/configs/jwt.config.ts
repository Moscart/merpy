import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const jwtConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().default('default_access_secret'),
  JWT_REFRESH_SECRET: z.string().default('default_refresh_secret'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ACCESS_EXPIRES_IN_MS: z.string().transform(Number).default(900000),
  JWT_REFRESH_EXPIRES_IN_MS: z.string().transform(Number).default(604800000),
});

export type JwtConfig = z.infer<typeof jwtConfigSchema>;

export default registerAs('jwt', (): JwtConfig => {
  const parsed = jwtConfigSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`JWT config validation error: ${parsed.error.message}`);
  }

  return parsed.data;
});
