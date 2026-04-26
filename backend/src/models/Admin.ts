import { Role } from '../types/enums';
import { UserModel } from './User';

export class Admin extends UserModel {
  constructor(id: string, name: string, email: string, passwordHash: string) {
    super(id, name, email, passwordHash, Role.ADMIN);
  }

  getPermissions(): string[] {
    return ['*']; // full access
  }
}