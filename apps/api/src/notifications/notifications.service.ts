import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationData, DatabaseExecutor, NotificationRecord, NotificationRepository } from './notification.repository';

/** Internal port used by membership use cases to persist user-facing events. */
export interface NotificationsPort {
  create(data: CreateNotificationData, executor?: DatabaseExecutor): Promise<NotificationRecord>;
}

@Injectable()
export class NotificationsService implements NotificationsPort {
  constructor(private readonly notifications: NotificationRepository) {}

  listForUser(userId: string): Promise<NotificationRecord[]> {
    return this.notifications.findByUserId(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationRecord> {
    const notification = await this.notifications.findById(notificationId);
    if (!notification) throw new NotFoundException('Notification not found.');
    if (notification.userId !== userId) throw new ForbiddenException('You do not own this notification.');
    const updated = await this.notifications.markRead(notificationId);
    if (!updated) throw new NotFoundException('Notification not found.');
    return updated;
  }

  create(data: CreateNotificationData, executor?: DatabaseExecutor): Promise<NotificationRecord> {
    return this.notifications.create(data, executor);
  }
}
