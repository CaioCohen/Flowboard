import { Controller, Get, Param, ParseUUIDPipe, Patch, Req } from '@nestjs/common';
import { IAuthenticatedUser } from '../auth/auth.service';
import { NotificationsService } from './notifications.service';

interface AuthenticatedRequest {
  user: IAuthenticatedUser;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.notifications.listForUser(request.user.id);
  }

  @Patch(':id/read')
  markRead(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notifications.markAsRead(request.user.id, id);
  }
}
