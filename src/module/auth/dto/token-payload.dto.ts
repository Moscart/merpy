import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const TokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  type: z.enum(['access', 'refresh']),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export class TokenPayloadDto extends createZodDto(TokenPayloadSchema) {}

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
