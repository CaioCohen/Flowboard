import { TicketsController } from './tickets.controller';

describe('TicketsController', () => {
  it('derives ticket creator identity from the authenticated request user', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'ticket-1' }) };
    const controller = new TicketsController(service as never);
    const dto = { title: 'Server-owned creator', status: 'TODO' };

    await controller.create('11111111-1111-4111-8111-111111111111', { user: { id: '22222222-2222-4222-8222-222222222222' } }, dto as never);

    expect(service.create).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', dto);
  });
});
