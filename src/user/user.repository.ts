import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  /**
   * Creates a new user in the database.
   * @param user Partial user object to create.
   * @returns The created user.
   */
  async create(user: Partial<User>): Promise<User> {
    return this.userModel.create(user);
  }

  /**
   * Finds a user by their email.
   * @param email The email of the user to find.
   * @returns The found user or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  /**
   * Finds all users in the database.
   * @returns An array of all users.
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().lean().exec();
  }
}
