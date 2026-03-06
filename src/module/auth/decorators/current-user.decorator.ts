import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] => {
    const request = ctx
      .switchToHttp()
      .getRequest<Express.Request & { user: AuthenticatedUser }>();

    const user = request.user;

    if (!user) {
      throw new Error('User not found in request');
    }

    return data ? user[data] : user;
  }
);
