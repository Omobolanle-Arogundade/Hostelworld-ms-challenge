import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { UserModule } from '../user.module';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { User, UserSchema } from '../user.schema';

describe('UserModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        UserModule,
      ],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(Model) // or a mock if necessary
      .compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve UserService', () => {
    const userService = module.get<UserService>(UserService);
    expect(userService).toBeDefined();
  });

  it('should resolve UserRepository', () => {
    const userRepo = module.get<UserRepository>(UserRepository);
    expect(userRepo).toBeDefined();
  });
});
