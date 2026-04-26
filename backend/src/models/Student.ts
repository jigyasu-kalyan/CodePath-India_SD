import { Role } from '../types/enums';
import { UserModel } from './User';

export class Student extends UserModel {
  constructor(id: string, name: string, email: string, passwordHash: string) {
    super(id, name, email, passwordHash, Role.STUDENT);
  }

  getPermissions(): string[] {
    return ['view_challenges', 'submit_code', 'view_leaderboard', 'join_classroom'];
  }
}