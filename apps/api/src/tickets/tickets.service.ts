import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';

export type TicketStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketRecord {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority?: TicketPriority | null;
  assigneeId?: string | null;
  createdById: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TicketRepositoryPort {
  findByWorkspace(workspaceId: string): Promise<TicketRecord[]>;
  findById(id: string): Promise<TicketRecord | null>;
  create(input: Omit<TicketRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TicketRecord>;
  update(id: string, input: Partial<Pick<TicketRecord, 'title' | 'description' | 'status' | 'priority' | 'assigneeId'>>): Promise<TicketRecord>;
}

export interface WorkspaceMembershipPort {
  findMember(workspaceId: string, userId: string): Promise<{ userId: string; role: 'ADMIN' | 'EMPLOYEE' } | null>;
}

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');
export const WORKSPACE_MEMBERSHIP = Symbol('WORKSPACE_MEMBERSHIP');

type CreateTicketInput = Pick<TicketRecord, 'title' | 'status'> & Partial<Pick<TicketRecord, 'description' | 'priority' | 'assigneeId'>>;
type UpdateTicketInput = Partial<Pick<TicketRecord, 'title' | 'description' | 'status' | 'priority' | 'assigneeId'>>;

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepositoryPort,
    @Inject(WORKSPACE_MEMBERSHIP) private readonly membership: WorkspaceMembershipPort,
  ) {}

  async findAll(workspaceId: string, userId: string): Promise<TicketRecord[]> {
    await this.requireMember(workspaceId, userId);
    return this.tickets.findByWorkspace(workspaceId);
  }

  async findOne(ticketId: string, userId: string): Promise<TicketRecord> {
    const ticket = await this.requireTicket(ticketId);
    await this.requireMember(ticket.workspaceId, userId);
    return ticket;
  }

  async create(workspaceId: string, userId: string, input: CreateTicketInput): Promise<TicketRecord> {
    await this.requireAdmin(workspaceId, userId);
    await this.requireAssigneeIsMember(workspaceId, input.assigneeId);
    return this.tickets.create({ ...input, workspaceId, createdById: userId });
  }

  async update(ticketId: string, userId: string, input: UpdateTicketInput): Promise<TicketRecord> {
    const ticket = await this.requireTicket(ticketId);
    await this.requireAdmin(ticket.workspaceId, userId);
    await this.requireAssigneeIsMember(ticket.workspaceId, input.assigneeId);
    return this.tickets.update(ticketId, input);
  }

  private async requireTicket(ticketId: string): Promise<TicketRecord> {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found.');
    return ticket;
  }

  private async requireMember(workspaceId: string, userId: string): Promise<{ userId: string; role: 'ADMIN' | 'EMPLOYEE' }> {
    const member = await this.membership.findMember(workspaceId, userId);
    if (!member) throw new ForbiddenException('Workspace membership is required.');
    return member;
  }

  private async requireAdmin(workspaceId: string, userId: string): Promise<void> {
    if ((await this.requireMember(workspaceId, userId)).role !== 'ADMIN') {
      throw new ForbiddenException('Ticket management requires an ADMIN workspace role.');
    }
  }

  private async requireAssigneeIsMember(workspaceId: string, assigneeId: string | null | undefined): Promise<void> {
    if (assigneeId && !(await this.membership.findMember(workspaceId, assigneeId))) {
      throw new ConflictException('Ticket assignee must be a workspace member.');
    }
  }
}
