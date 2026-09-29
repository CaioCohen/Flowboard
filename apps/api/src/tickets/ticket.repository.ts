import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { TicketRecord, TicketRepositoryPort } from './tickets.service';

const SELECT_TICKET = 'id, "workspaceId" AS "workspaceId", title, description, status, priority, "assigneeId" AS "assigneeId", "createdById" AS "createdById", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt"';

@Injectable()
export class TicketRepository implements TicketRepositoryPort {
  constructor(private readonly database: DatabaseService) {}

  async findByWorkspace(workspaceId: string): Promise<TicketRecord[]> {
    const result = await this.database.query<TicketRecord>(`SELECT ${SELECT_TICKET} FROM "Ticket" WHERE "workspaceId" = $1 ORDER BY "updatedAt" DESC`, [workspaceId]);
    return result.rows;
  }

  async findById(id: string): Promise<TicketRecord | null> {
    const result = await this.database.query<TicketRecord>(`SELECT ${SELECT_TICKET} FROM "Ticket" WHERE id = $1`, [id]);
    return result.rows[0] ?? null;
  }

  async create(input: Omit<TicketRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TicketRecord> {
    const result = await this.database.query<TicketRecord>(
      `INSERT INTO "Ticket" (id, "workspaceId", title, description, status, priority, "assigneeId", "createdById", "updatedAt") VALUES ($1, $2, $3, $4, $5::"TicketStatus", $6::"TicketPriority", $7, $8, NOW()) RETURNING ${SELECT_TICKET}`,
      [randomUUID(), input.workspaceId, input.title, input.description ?? null, input.status, input.priority ?? null, input.assigneeId ?? null, input.createdById],
    );
    return result.rows[0];
  }

  async update(id: string, input: Partial<Pick<TicketRecord, 'title' | 'description' | 'status' | 'priority' | 'assigneeId'>>): Promise<TicketRecord> {
    const fields = Object.entries(input).filter(([, value]) => value !== undefined);
    const values = fields.map(([, value]) => value ?? null);
    const assignments = fields.map(([field], index) => {
      const column = field === 'assigneeId' ? '"assigneeId"' : field;
      const cast = field === 'status' ? '::"TicketStatus"' : field === 'priority' ? '::"TicketPriority"' : '';
      return `${column} = $${index + 2}${cast}`;
    });
    assignments.push('"updatedAt" = NOW()');
    const result = await this.database.query<TicketRecord>(`UPDATE "Ticket" SET ${assignments.join(', ')} WHERE id = $1 RETURNING ${SELECT_TICKET}`, [id, ...values]);
    return result.rows[0];
  }

  async remove(id: string): Promise<void> {
    await this.database.query('DELETE FROM "Ticket" WHERE id = $1', [id]);
  }
}
