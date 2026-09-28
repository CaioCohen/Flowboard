import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

export interface IUserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IUserWithPassword extends IUserRecord {
  passwordHash: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<IUserRecord | null> {
    const result = await this.database.query<IUserRecord>(
      'SELECT id, "firstName" AS "firstName", "lastName" AS "lastName", email FROM "User" WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<IUserWithPassword | null> {
    const result = await this.database.query<IUserWithPassword>(
      'SELECT id, "firstName" AS "firstName", "lastName" AS "lastName", email, "passwordHash" AS "passwordHash" FROM "User" WHERE email = $1',
      [email],
    );
    return result.rows[0] ?? null;
  }

  async create(input: { firstName: string; lastName: string; email: string; passwordHash: string }): Promise<IUserRecord> {
    const result = await this.database.query<IUserRecord>(
      'INSERT INTO "User" (id, "firstName", "lastName", email, "passwordHash", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, "firstName" AS "firstName", "lastName" AS "lastName", email',
      [randomUUID(), input.firstName, input.lastName, input.email, input.passwordHash],
    );
    return result.rows[0];
  }
}
