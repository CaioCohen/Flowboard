import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RuntimeConfigService } from '../config/runtime-config.service';

export interface IJwtPayload {
  sub: string;
  email: string;
}

interface IUserForToken {
  id: string;
  email: string;
}

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwt: JwtService, private readonly config: RuntimeConfigService) {}

  sign(user: IUserForToken): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, email: user.email }, { secret: this.config.jwtSecret, expiresIn: durationInSeconds(this.config.jwtExpiration) });
  }

  async verify(token: string): Promise<IJwtPayload> {
    try {
      return await this.jwt.verifyAsync<IJwtPayload>(token, { secret: this.config.jwtSecret });
    } catch {
      throw new UnauthorizedException();
    }
  }
}

function durationInSeconds(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) throw new Error('JWT expiration must be validated at startup');
  return Number(match[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd'];
}
