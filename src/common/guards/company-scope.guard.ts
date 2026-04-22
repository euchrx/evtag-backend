import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.role === 'SUPER_ADMIN') {
      const companyIdHeader = request.headers['x-company-id'];

      if (!companyIdHeader || typeof companyIdHeader !== 'string') {
        throw new BadRequestException(
          'SUPER_ADMIN deve informar o header x-company-id.',
        );
      }

      request.companyId = companyIdHeader;
      return true;
    }

    if (!user.companyId) {
      throw new BadRequestException('Usuário sem empresa vinculada.');
    }

    request.companyId = user.companyId;
    return true;
  }
}