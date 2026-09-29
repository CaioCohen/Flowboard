import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const notification = {
    id: '11111111-1111-4111-8111-111111111111',
    userId: 'recipient-id',
    workspaceId: 'workspace-id',
    actorUserId: 'actor-id',
    type: 'WORKSPACE_ADDED' as const,
    title: 'You were added to a workspace',
    message: 'You were added to Engineering.',
    isRead: false,
    createdAt: new Date('2026-09-28T12:00:00.000Z'),
  };

  it('lists only notifications belonging to the requesting user, newest first', async () => {
    const repository = { findByUserId: jest.fn().mockResolvedValue([notification]) };
    const service = new NotificationsService(repository as never);

    await expect(service.listForUser('recipient-id')).resolves.toEqual([notification]);
    expect(repository.findByUserId).toHaveBeenCalledWith('recipient-id');
  });

  it('marks an unread notification owned by the requesting user as read', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(notification),
      markRead: jest.fn().mockResolvedValue({ ...notification, isRead: true }),
    };
    const service = new NotificationsService(repository as never);

    await expect(service.markAsRead('recipient-id', notification.id)).resolves.toEqual({ ...notification, isRead: true });
    expect(repository.markRead).toHaveBeenCalledWith(notification.id);
  });

  it('rejects marking another user notification as read', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(notification) };
    const service = new NotificationsService(repository as never);

    await expect(service.markAsRead('different-user', notification.id)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('reports a missing notification when marking it as read', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) };
    const service = new NotificationsService(repository as never);

    await expect(service.markAsRead('recipient-id', notification.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a contextual membership notification through the internal port', async () => {
    const repository = { create: jest.fn().mockResolvedValue(notification) };
    const service = new NotificationsService(repository as never);

    await expect(service.create({
      userId: 'recipient-id', workspaceId: 'workspace-id', actorUserId: 'actor-id',
      type: 'WORKSPACE_ADDED', title: 'You were added to a workspace', message: 'You were added to Engineering.',
    })).resolves.toEqual(notification);
  });

  it('forwards a caller transaction executor when creating a membership notification', async () => {
    const repository = { create: jest.fn().mockResolvedValue(notification) };
    const transaction = { query: jest.fn() };
    const service = new NotificationsService(repository as never);

    await service.create({
      userId: 'recipient-id', workspaceId: 'workspace-id', actorUserId: 'actor-id',
      type: 'WORKSPACE_ADDED', title: 'You were added to a workspace', message: 'You were added to Engineering.',
    }, transaction);

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'recipient-id' }), transaction);
  });
});
