import { TicketRepository } from './ticket.repository';

describe('TicketRepository', () => {
  it('persists server-owned ticket fields and returns the stored record', async () => {
    const database = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'ticket-1', workspaceId: 'workspace-1' }] }) };
    const repository = new TicketRepository(database as never);

    await expect(repository.create({ workspaceId: 'workspace-1', title: 'Build API', status: 'TODO', createdById: 'user-1' })).resolves.toEqual({ id: 'ticket-1', workspaceId: 'workspace-1' });
    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO "Ticket"'), expect.arrayContaining(['workspace-1', 'Build API', 'TODO', 'user-1']));
  });
});
