import { Role } from '../types/enums';
import { UserModel } from '../models/User';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Admin } from '../models/Admin';

// Factory Pattern — creates correct User subtype based on role
export class UserFactory {
  static create(
    role: Role,
    id: string,
    name: string,
    email: string,
    passwordHash: string
  ): UserModel {
    switch (role) {
      case Role.STUDENT: return new Student(id, name, email, passwordHash);
      case Role.TEACHER: return new Teacher(id, name, email, passwordHash);
      case Role.ADMIN:   return new Admin(id, name, email, passwordHash);
      default: throw new Error(`Unknown role: ${role}`);
    }
  }
}