import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';

export interface DatabaseExecutor {
  query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<{ rows: T[] }>;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  workspaceId: string | null;
  actorUserId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  workspaceId?: string;
  actorUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByUserId(userId: string): Promise<NotificationRecord[]> {
    const result = await this.database.query<NotificationRecord>(`
      SELECT id, "userId", "workspaceId", "actorUserId", type, title, message, "isRead", "createdAt"
      FROM "Notification"
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC, id DESC
    `, [userId]);
    return result.rows;
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const result = await this.database.query<NotificationRecord>(`
      SELECT id, "userId", "workspaceId", "actorUserId", type, title, message, "isRead", "createdAt"
      FROM "Notification"
      WHERE id = $1
    `, [id]);
    return result.rows[0] ?? null;
  }

  async markRead(id: string): Promise<NotificationRecord | null> {
    const result = await this.database.query<NotificationRecord>(`
      UPDATE "Notification"
      SET "isRead" = true
      WHERE id = $1
      RETURNING id, "userId", "workspaceId", "actorUserId", type, title, message, "isRead", "createdAt"
    `, [id]);
    return result.rows[0] ?? null;
  }

  async create(data: CreateNotificationData, executor: DatabaseExecutor = this.database): Promise<NotificationRecord> {
    const result = await executor.query<NotificationRecord>(`
      INSERT INTO "Notification" ("userId", "workspaceId", "actorUserId", type, title, message)
      VALUES ($1, $2, $3, $4::"NotificationType", $5, $6)
      RETURNING id, "userId", "workspaceId", "actorUserId", type, title, message, "isRead", "createdAt"
    `, [data.userId, data.workspaceId ?? null, data.actorUserId ?? null, data.type, data.title, data.message]);
    return result.rows[0];
  }
}
