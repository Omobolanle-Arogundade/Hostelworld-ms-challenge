import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { User } from './user.schema';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(
    email: string,
    password: string,
    name: string,
    role: Role,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepo.create({
      email,
      password: hashedPassword,
      name,
      role,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
