import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WorkspaceMembershipPort } from './tickets.service';

@Injectable()
export class WorkspaceMembershipRepository implements WorkspaceMembershipPort {
  constructor(private readonly database: DatabaseService) {}

  async findMember(workspaceId: string, userId: string): Promise<{ userId: string; role: 'ADMIN' | 'EMPLOYEE' } | null> {
    const result = await this.database.query<{ userId: string; role: 'ADMIN' | 'EMPLOYEE' }>(
      'SELECT "userId" AS "userId", role FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2',
      [workspaceId, userId],
    );
    return result.rows[0] ?? null;
  }
}
