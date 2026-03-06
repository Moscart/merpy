import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRefreshPayload } from '../types/jwt-payload.type';

export const RefreshPayload = createParamDecorator(
  (
    data: keyof JwtRefreshPayload | undefined,
    ctx: ExecutionContext
  ): JwtRefreshPayload | JwtRefreshPayload[keyof JwtRefreshPayload] => {
    const request = ctx
      .switchToHttp()
      .getRequest<Express.Request & { user: JwtRefreshPayload }>();

    const payload = request.user;

    if (!payload) {
      throw new Error('Payload not found in request');
    }

    return data ? payload[data] : payload;
  }
);
