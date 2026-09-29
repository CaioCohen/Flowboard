import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { DatabaseExecutor } from '../notifications/notification.repository';

export enum WorkspaceRole { ADMIN = 'ADMIN', EMPLOYEE = 'EMPLOYEE' }

export interface IWorkspaceMember {
  id: string;
  userId: string;
  role: WorkspaceRole;
  email: string;
  name: string;
}

export interface IWorkspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  members?: IWorkspaceMember[];
}

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly database: DatabaseService) {}

  async createWithAdmin(userId: string, name: string): Promise<IWorkspace> {
    const workspaceId = randomUUID();
    await this.database.query(
      'WITH workspace AS (INSERT INTO "Workspace" (id, name, "updatedAt") VALUES ($1, $2, NOW()) RETURNING id) INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "updatedAt") SELECT $3, id, $4, $5, NOW() FROM workspace',
      [workspaceId, name, randomUUID(), userId, WorkspaceRole.ADMIN],
    );
    return { id: workspaceId, name, role: WorkspaceRole.ADMIN, members: [] };
  }

  async listForUser(userId: string): Promise<IWorkspace[]> {
    const result = await this.database.query<IWorkspace>('SELECT w.id, w.name, wm.role FROM "Workspace" w JOIN "WorkspaceMember" wm ON wm."workspaceId" = w.id WHERE wm."userId" = $1 ORDER BY w."createdAt"', [userId]);
    return result.rows;
  }

  async findById(id: string, includeMembers = false): Promise<IWorkspace | null> {
    const workspace = await this.database.query<IWorkspace>('SELECT id, name FROM "Workspace" WHERE id = $1', [id]);
    const row = workspace.rows[0];
    if (!row) return null;
    if (includeMembers) row.members = await this.listMembers(id);
    return row;
  }

  async findMembership(workspaceId: string, userId: string): Promise<{ userId: string; role: WorkspaceRole } | null> {
    const result = await this.database.query<{ userId: string; role: WorkspaceRole }>('SELECT "userId" AS "userId", role FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2', [workspaceId, userId]);
    return result.rows[0] ?? null;
  }

  async listMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
    const result = await this.database.query<IWorkspaceMember>('SELECT wm.id, wm."userId" AS "userId", wm.role, u.email, CONCAT(u."firstName", \' \', u."lastName") AS name FROM "WorkspaceMember" wm JOIN "User" u ON u.id = wm."userId" WHERE wm."workspaceId" = $1 ORDER BY wm."createdAt"', [workspaceId]);
    return result.rows;
  }

  async findMember(workspaceId: string, userId: string, executor: DatabaseExecutor = this.database): Promise<{ userId: string; role: WorkspaceRole } | null> {
    const result = await executor.query<{ userId: string; role: WorkspaceRole }>('SELECT "userId" AS "userId", role FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2', [workspaceId, userId]);
    return result.rows[0] ?? null;
  }

  async findUserByEmail(email: string): Promise<{ id: string } | null> {
    const result = await this.database.query<{ id: string }>('SELECT id FROM "User" WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole, executor: DatabaseExecutor = this.database): Promise<IWorkspaceMember> {
    const result = await executor.query<IWorkspaceMember>('WITH member AS (INSERT INTO "WorkspaceMember" (id, "workspaceId", "userId", role, "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING id, "userId", role) SELECT member.id, member."userId" AS "userId", member.role, u.email, CONCAT(u."firstName", \' \', u."lastName") AS name FROM member JOIN "User" u ON u.id = member."userId"', [randomUUID(), workspaceId, userId, role]);
    return result.rows[0];
  }

  async updateName(id: string, name: string): Promise<IWorkspace> {
    const result = await this.database.query<IWorkspace>('UPDATE "Workspace" SET name = $2, "updatedAt" = NOW() WHERE id = $1 RETURNING id, name', [id, name]);
    return result.rows[0];
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole, executor: DatabaseExecutor = this.database): Promise<IWorkspaceMember> {
    const result = await executor.query<IWorkspaceMember>('WITH member AS (UPDATE "WorkspaceMember" SET role = $3, "updatedAt" = NOW() WHERE "workspaceId" = $1 AND "userId" = $2 RETURNING id, "userId", role) SELECT member.id, member."userId" AS "userId", member.role, u.email, CONCAT(u."firstName", \' \', u."lastName") AS name FROM member JOIN "User" u ON u.id = member."userId"', [workspaceId, userId, role]);
    return result.rows[0];
  }

  async lockMembers(workspaceId: string, executor: DatabaseExecutor = this.database): Promise<void> {
    await executor.query('SELECT id FROM "WorkspaceMember" WHERE "workspaceId" = $1 FOR UPDATE', [workspaceId]);
  }

  async countAdmins(workspaceId: string, executor: DatabaseExecutor = this.database): Promise<number> {
    const result = await executor.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND role = $2', [workspaceId, WorkspaceRole.ADMIN]);
    return Number(result.rows[0].count);
  }

  async removeMember(workspaceId: string, userId: string, executor: DatabaseExecutor = this.database): Promise<void> {
    await executor.query('DELETE FROM "WorkspaceMember" WHERE "workspaceId" = $1 AND "userId" = $2', [workspaceId, userId]);
  }
}
