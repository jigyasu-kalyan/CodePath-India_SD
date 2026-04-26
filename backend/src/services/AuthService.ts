import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { UserFactory } from '../factories/UserFactory';
import { ENV } from '../config/env';
import { Role } from '../types/enums';
import { RegisterDTO, LoginDTO, JWTPayload } from '../types/dtos';

const repo = new UserRepository();

export class AuthService {
  async register(data: RegisterDTO) {
    const existing = await repo.findByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = (data.role as Role) || Role.STUDENT;

    const dbUser = await repo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role,
    });

    const userModel = UserFactory.create(role, dbUser.id, dbUser.name, dbUser.email, passwordHash);
    const token = this.generateToken(dbUser.id, role);

    return { user: userModel.toJSON(), token };
  }

  async login(data: LoginDTO) {
    const dbUser = await repo.findByEmail(data.email);
    if (!dbUser) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(data.password, dbUser.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const userModel = UserFactory.create(
      dbUser.role as Role,
      dbUser.id,
      dbUser.name,
      dbUser.email,
      dbUser.passwordHash
    );
    const token = this.generateToken(dbUser.id, dbUser.role as Role);

    return { user: userModel.toJSON(), token };
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async refreshToken(token: string): Promise<string> {
    const payload = this.verifyToken(token);
    return this.generateToken(payload.userId, payload.role as Role);
  }

  private generateToken(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  }
}