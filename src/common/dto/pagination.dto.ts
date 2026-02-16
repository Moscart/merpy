import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().int().positive().default(1)
  ),
  limit: z
    .preprocess(
      (val) => parseInt(z.string().parse(val), 10),
      z.number().int().positive().default(10)
    )
    .default(10),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}
