import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(10).max(15).optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
