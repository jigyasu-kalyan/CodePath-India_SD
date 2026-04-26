import { Role } from '../types/enums';
import { UserModel } from './User';

export class Teacher extends UserModel {
  constructor(id: string, name: string, email: string, passwordHash: string) {
    super(id, name, email, passwordHash, Role.TEACHER);
  }

  getPermissions(): string[] {
    return ['view_challenges', 'submit_code', 'create_classroom', 'manage_students', 'view_leaderboard'];
  }
}