import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserRepository } from '../user.repository';
import { User } from '../user.schema';

describe('UserRepository', () => {
  let repo: UserRepository;
  let model: jest.Mocked<Model<User>>;

  const mockUser = {
    _id: 'user123',
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed',
    role: 'user',
  } as User;

  const execMock = jest.fn();

  beforeEach(async () => {
    execMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken('User'),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<UserRepository>(UserRepository);
    model = module.get(getModelToken('User'));

    // Add mock return types with exec() included
    (model.findOne as unknown as jest.Mock).mockReturnValue({ exec: execMock });
    (model.find as unknown as jest.Mock).mockReturnValue({ exec: execMock });
  });

  describe('create', () => {
    it('should call userModel.create with user data', async () => {
      (model.create as jest.Mock).mockResolvedValue(mockUser);
      const result = await repo.create(mockUser);
      expect(model.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user when email matches', async () => {
      execMock.mockResolvedValueOnce(mockUser);
      const result = await repo.findByEmail('john@example.com');
      expect(model.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      execMock.mockResolvedValueOnce(null);
      const result = await repo.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      execMock.mockResolvedValueOnce([mockUser]);
      const result = await repo.findAll();
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });
});
