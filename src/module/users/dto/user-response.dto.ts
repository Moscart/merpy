import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const userResponseSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}
