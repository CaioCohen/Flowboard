import { ConflictException, ForbiddenException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRole } from './workspace.repository';

describe('WorkspaceService', () => {
  const actor = { id: '11111111-1111-4111-8111-111111111111', firstName: 'Admin', lastName: 'User', email: 'admin@example.test' };

  it('creates a workspace with its creator as ADMIN', async () => {
    const repository = { createWithAdmin: jest.fn().mockResolvedValue({ id: 'workspace-1', name: 'Engineering', role: 'ADMIN', members: [] }) };
    const service = new WorkspaceService(repository as never, {} as never, {} as never);

    await expect(service.create(actor, { name: 'Engineering' })).resolves.toMatchObject({ id: 'workspace-1', role: 'ADMIN' });
    expect(repository.createWithAdmin).toHaveBeenCalledWith(actor.id, 'Engineering');
  });

  it('refuses to change the final administrator to EMPLOYEE', async () => {
    const repository = {
      findMembership: jest.fn().mockResolvedValue({ role: WorkspaceRole.ADMIN }),
      findMember: jest.fn().mockResolvedValue({ userId: '22222222-2222-4222-8222-222222222222', role: WorkspaceRole.ADMIN }),
      lockMembers: jest.fn().mockResolvedValue(undefined),
      countAdmins: jest.fn().mockResolvedValue(1),
      findById: jest.fn().mockResolvedValue({ id: 'workspace-1', name: 'Engineering' }),
    };
    const database = { transaction: jest.fn((operation) => operation({ query: jest.fn() })) };
    const service = new WorkspaceService(repository as never, database as never, {} as never);

    await expect(service.changeMemberRole(actor, 'workspace-1', '22222222-2222-4222-8222-222222222222', { role: WorkspaceRole.EMPLOYEE }))
      .rejects.toEqual(new ConflictException('A workspace must have at least one administrator.'));
  });

  it('rechecks the administrator invariant inside the membership transaction', async () => {
    const transaction = { query: jest.fn() };
    const countAdmins = jest.fn().mockResolvedValue(2);
    const repository = {
      findMembership: jest.fn().mockResolvedValue({ role: WorkspaceRole.ADMIN }),
      findMember: jest.fn().mockResolvedValue({ userId: '22222222-2222-4222-8222-222222222222', role: WorkspaceRole.ADMIN }),
      lockMembers: jest.fn().mockImplementation(async () => countAdmins.mockResolvedValue(1)),
      countAdmins,
      updateMemberRole: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 'workspace-1', name: 'Engineering' }),
    };
    const database = { transaction: jest.fn((operation) => operation(transaction)) };
    const service = new WorkspaceService(repository as never, database as never, { create: jest.fn() } as never);

    await expect(service.changeMemberRole(actor, 'workspace-1', '22222222-2222-4222-8222-222222222222', { role: WorkspaceRole.EMPLOYEE }))
      .rejects.toEqual(new ConflictException('A workspace must have at least one administrator.'));
  });

  it('maps a concurrent duplicate membership insertion to the documented conflict', async () => {
    const transaction = { query: jest.fn() };
    const repository = {
      findMembership: jest.fn().mockResolvedValue({ role: WorkspaceRole.ADMIN }),
      findUserByEmail: jest.fn().mockResolvedValue({ id: '22222222-2222-4222-8222-222222222222' }),
      findMember: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue({ id: 'workspace-1', name: 'Engineering' }),
      addMember: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    const database = { transaction: jest.fn((operation) => operation(transaction)) };
    const service = new WorkspaceService(repository as never, database as never, { create: jest.fn() } as never);

    await expect(service.addMember(actor, 'workspace-1', { email: 'member@example.test', role: WorkspaceRole.EMPLOYEE }))
      .rejects.toEqual(new ConflictException('User is already a workspace member.'));
  });

  it('refuses administrative changes by an EMPLOYEE', async () => {
    const repository = { findMembership: jest.fn().mockResolvedValue({ role: WorkspaceRole.EMPLOYEE }) };
    const service = new WorkspaceService(repository as never, {} as never, {} as never);

    await expect(service.rename(actor, 'workspace-1', { name: 'Product' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('persists an added-member notification in the membership transaction', async () => {
    const transaction = { query: jest.fn() };
    const repository = {
      findMembership: jest.fn().mockResolvedValue({ role: WorkspaceRole.ADMIN }),
      findUserByEmail: jest.fn().mockResolvedValue({ id: '22222222-2222-4222-8222-222222222222' }),
      findMember: jest.fn().mockResolvedValue(null),
      addMember: jest.fn().mockResolvedValue({ userId: '22222222-2222-4222-8222-222222222222', role: WorkspaceRole.EMPLOYEE }),
      findById: jest.fn().mockResolvedValue({ id: 'workspace-1', name: 'Engineering' }),
    };
    const database = { transaction: jest.fn((operation) => operation(transaction)) };
    const notifications = { create: jest.fn().mockResolvedValue({}) };
    const service = new WorkspaceService(repository as never, database as never, notifications as never);

    await service.addMember(actor, 'workspace-1', { email: 'member@example.test', role: WorkspaceRole.EMPLOYEE });

    expect(notifications.create).toHaveBeenCalledWith(expect.objectContaining({ userId: '22222222-2222-4222-8222-222222222222', type: 'WORKSPACE_ADDED' }), transaction);
  });
});
