import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { PaginationResult } from '../dto/pagination.dto';

export interface StandardResponse<T> {
  data: T;
}

export type Response<T> = StandardResponse<T> | PaginationResult<T>;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => {
        if (this.isPaginationResult(data)) {
          return data as PaginationResult<T>;
        }
        return { data };
      })
    );
  }

  private isPaginationResult(data: unknown): data is PaginationResult<unknown> {
    return (
      !!data && typeof data === 'object' && 'data' in data && 'meta' in data
    );
  }
}
