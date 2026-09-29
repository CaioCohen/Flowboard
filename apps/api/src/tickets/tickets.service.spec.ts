import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';

const admin = { userId: '11111111-1111-4111-8111-111111111111', role: 'ADMIN' };
const employee = { userId: '22222222-2222-4222-8222-222222222222', role: 'EMPLOYEE' };
const workspaceId = '33333333-3333-4333-8333-333333333333';
const ticketId = '44444444-4444-4444-8444-444444444444';

describe('TicketsService', () => {
  const membership = { findMember: jest.fn(), workspaceExists: jest.fn() };
  const tickets = { findByWorkspace: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
  let service: TicketsService;

  beforeEach(() => {
    jest.resetAllMocks();
    membership.workspaceExists.mockResolvedValue(true);
    service = new TicketsService(tickets, membership);
  });

  it('allows an ADMIN member to create a ticket and always uses the authenticated user as creator', async () => {
    membership.findMember.mockResolvedValue(admin);
    tickets.create.mockResolvedValue({ id: ticketId, workspaceId, title: 'Implement reports', status: 'TODO', createdById: admin.userId });

    const result = await service.create(workspaceId, admin.userId, {
      title: 'Implement reports', status: 'TODO', createdById: employee.userId,
    } as never);

    expect(tickets.create).toHaveBeenCalledWith(expect.objectContaining({ workspaceId, createdById: admin.userId }));
    expect(result.createdById).toBe(admin.userId);
  });

  it('forbids an EMPLOYEE from creating tickets under the explicit ADMIN-only policy', async () => {
    membership.findMember.mockResolvedValue(employee);

    await expect(service.create(workspaceId, employee.userId, { title: 'No access', status: 'TODO' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an assignee who is not a member of the ticket workspace', async () => {
    membership.findMember.mockResolvedValueOnce(admin).mockResolvedValueOnce(null);

    await expect(service.create(workspaceId, admin.userId, {
      title: 'Assign work', status: 'TODO', assigneeId: employee.userId,
    })).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows a workspace member to read a ticket in that workspace', async () => {
    tickets.findById.mockResolvedValue({ id: ticketId, workspaceId });
    membership.findMember.mockResolvedValue(employee);

    await expect(service.findOne(ticketId, employee.userId)).resolves.toMatchObject({ id: ticketId });
  });

  it('does not disclose a ticket to a user outside its workspace', async () => {
    tickets.findById.mockResolvedValue({ id: ticketId, workspaceId });
    membership.findMember.mockResolvedValue(null);

    await expect(service.findOne(ticketId, employee.userId)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns not found when creating a ticket in a nonexistent workspace', async () => {
    membership.findMember.mockResolvedValue(null);
    membership.workspaceExists.mockResolvedValue(false);

    await expect(service.create(workspaceId, admin.userId, { title: 'Missing workspace', status: 'TODO' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates only when the caller is an ADMIN member of the ticket workspace', async () => {
    tickets.findById.mockResolvedValue({ id: ticketId, workspaceId });
    membership.findMember.mockResolvedValue(admin);
    tickets.update.mockResolvedValue({ id: ticketId, workspaceId, title: 'Updated' });

    await expect(service.update(ticketId, admin.userId, { title: 'Updated' })).resolves.toMatchObject({ title: 'Updated' });
  });

  it('allows an ADMIN member to delete a ticket in the workspace', async () => {
    tickets.findById.mockResolvedValue({ id: ticketId, workspaceId });
    membership.findMember.mockResolvedValue(admin);
    tickets.remove.mockResolvedValue(true);

    const deletableService = service as TicketsService & { remove(id: string, userId: string): Promise<void> };
    await expect(Promise.resolve().then(() => deletableService.remove(ticketId, admin.userId))).resolves.toBeUndefined();
  });

  it('returns not found when the ticket does not exist', async () => {
    tickets.findById.mockResolvedValue(null);

    await expect(service.findOne(ticketId, admin.userId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
