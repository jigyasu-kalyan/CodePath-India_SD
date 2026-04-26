import { Role } from '../types/enums';

// Abstract base class — Liskov Substitution + Open/Closed principles
export abstract class UserModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    protected passwordHash: string,
    public readonly role: Role,
    public readonly createdAt: Date = new Date()
  ) {}

  abstract getPermissions(): string[];

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}