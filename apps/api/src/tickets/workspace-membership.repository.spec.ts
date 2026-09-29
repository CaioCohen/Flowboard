import { WorkspaceMembershipRepository } from './workspace-membership.repository';

describe('WorkspaceMembershipRepository', () => {
  it('looks up a membership by workspace and user without exposing other workspace data', async () => {
    const database = { query: jest.fn().mockResolvedValue({ rows: [{ userId: 'user-1', role: 'ADMIN' }] }) };
    const repository = new WorkspaceMembershipRepository(database as never);

    await expect(repository.findMember('workspace-1', 'user-1')).resolves.toEqual({ userId: 'user-1', role: 'ADMIN' });
    expect(database.query).toHaveBeenCalledWith(expect.stringContaining('WHERE "workspaceId" = $1 AND "userId" = $2'), ['workspace-1', 'user-1']);
  });
});
