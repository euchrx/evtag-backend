import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../interfaces/current-user.interface';

export const CurrentUserDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);