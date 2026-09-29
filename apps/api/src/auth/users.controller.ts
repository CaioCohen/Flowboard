import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { IAuthenticatedUser } from './auth.service';

type AuthenticatedRequest = Request & { user: IAuthenticatedUser };

@Controller('users')
export class UsersController {
  @Get('me')
  me(@Req() request: AuthenticatedRequest): IAuthenticatedUser {
    return request.user;
  }
}
