import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthService } from './jwt-auth.service';
import { UserRepository, IUserRecord } from './user.repository';

const scrypt = promisify(scryptCallback);
const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect.';

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
    private readonly users: UserRepository,
    private readonly jwtAuth: JwtAuthService,
  ) {}

  async register(dto: RegisterDto): Promise<IAuthSession> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) throw new ConflictException('Email is already in use.');
    if (dto.password !== dto.passwordConfirmation) throw new ConflictException('Password confirmation does not match.');

    const passwordHash = await this.hashPassword(dto.password);
    try {
      return this.createSession(await this.users.create({ firstName: dto.firstName.trim(), lastName: dto.lastName.trim(), email, passwordHash }));
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Email is already in use.');
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<IAuthSession> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }
    return this.createSession(user);
  }

  private async createSession(row: IUserRecord): Promise<IAuthSession> {
    const user: IAuthenticatedUser = { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email };
    return { user, token: await this.jwtAuth.sign(user) };
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

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
