import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  const user = { id: 'recipient-id', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' };
  const item = { id: '11111111-1111-4111-8111-111111111111', isRead: false };

  it('uses the authenticated user identity to list notifications', async () => {
    const notifications = { listForUser: jest.fn().mockResolvedValue([item]) };
    const controller = new NotificationsController(notifications as never);

    await expect(controller.list({ user })).resolves.toEqual([item]);
    expect(notifications.listForUser).toHaveBeenCalledWith('recipient-id');
  });

  it('uses the authenticated user identity to mark a notification as read', async () => {
    const notifications = { markAsRead: jest.fn().mockResolvedValue({ ...item, isRead: true }) };
    const controller = new NotificationsController(notifications as never);

    await expect(controller.markRead({ user }, item.id)).resolves.toEqual({ ...item, isRead: true });
    expect(notifications.markAsRead).toHaveBeenCalledWith('recipient-id', item.id);
  });
});
