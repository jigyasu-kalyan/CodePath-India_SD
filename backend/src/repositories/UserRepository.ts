import { prisma } from '../config/database';
import { Role } from '../types/enums';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }) {
    return prisma.user.create({ data });
  }

  async findAll() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  }
}