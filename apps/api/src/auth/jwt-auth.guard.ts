import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthService } from './jwt-auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UserRepository } from './user.repository';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtAuthService, private readonly users: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException();
    const payload = await this.jwt.verify(token);
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    request.user = user;
    return true;
  }
}
