import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestCompanyContext } from '../interfaces/request-company-context.interface';

export const CompanyContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestCompanyContext => {
    const request = ctx.switchToHttp().getRequest();

    return {
      companyId: request.companyId,
    };
  },
);