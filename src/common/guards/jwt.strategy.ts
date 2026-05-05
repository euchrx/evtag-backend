import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { CurrentUser } from 'src/common/interfaces/current-user.interface';

type JwtPayload = {
  userId?: string;
  email?: string;
  role?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR';
  companyId?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.JWT_SECRET || 'dev-secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    if (!payload?.userId || !payload?.email || !payload?.role) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId ?? null,
    };
  }
}