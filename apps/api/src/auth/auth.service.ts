import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { RuntimeConfigService } from '../config/runtime-config.service';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const scrypt = promisify(scryptCallback);
const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect.';

interface IUserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
}

export interface IAuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IAuthSession {
  token: string;
  user: IAuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: RuntimeConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<IAuthSession> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.database.query<IUserRow>('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) throw new ConflictException('Email is already in use.');
    if (dto.password !== dto.passwordConfirmation) throw new ConflictException('Password confirmation does not match.');

    const passwordHash = await this.hashPassword(dto.password);
    try {
      const result = await this.database.query<IUserRow>(
        'INSERT INTO "User" (id, "firstName", "lastName", email, "passwordHash", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, "firstName" AS first_name, "lastName" AS last_name, email',
        [randomUUID(), dto.firstName.trim(), dto.lastName.trim(), email, passwordHash, new Date()],
      );
      return this.createSession(result.rows[0]);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Email is already in use.');
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<IAuthSession> {
    const email = dto.email.trim().toLowerCase();
    const result = await this.database.query<IUserRow>(
      'SELECT id, "firstName" AS first_name, "lastName" AS last_name, email, "passwordHash" AS password_hash FROM "User" WHERE email = $1', [email],
    );
    const user = result.rows[0];
    if (!user?.password_hash || !(await this.verifyPassword(dto.password, user.password_hash))) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }
    return this.createSession(user);
  }

  private async createSession(row: IUserRow): Promise<IAuthSession> {
    const user: IAuthenticatedUser = { id: row.id, firstName: row.first_name, lastName: row.last_name, email: row.email };
    return { user, token: this.signToken(user) };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = await scrypt(password, salt, 64) as Buffer;
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, hash] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'hex');
    if (expected.length !== 64) return false;
    const derived = await scrypt(password, salt, expected.length) as Buffer;
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  private signToken(user: IAuthenticatedUser): string {
    const header = this.base64Url({ alg: 'HS256', typ: 'JWT' });
    const payload = this.base64Url({ sub: user.id, exp: Math.floor(Date.now() / 1000) + this.expirationInSeconds() });
    const signature = createHmac('sha256', this.config.jwtSecret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  private base64Url(value: object): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private expirationInSeconds(): number {
    const match = /^(\d+)\s*([smhd])$/.exec(this.config.jwtExpiration.trim());
    if (!match) return 3600;
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd'];
    return Number(match[1]) * multiplier;
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
