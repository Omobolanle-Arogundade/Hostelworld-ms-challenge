import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';
import { User } from '../user.schema';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<UserRepository>;

  const mockUser: Partial<User> = {
    _id: 'abc123',
    email: 'john@example.com',
    password: 'hashedPassword',
    name: 'John Doe',
    role: Role.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(UserRepository);
  });

  describe('create', () => {
    it('should hash the password and call userRepo.create with all fields', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      repo.create.mockResolvedValue(mockUser as User);

      const result = await service.create(
        'john@example.com',
        'plainPassword',
        'John Doe',
        Role.USER,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(repo.create).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'hashedPassword',
        name: 'John Doe',
        role: Role.USER,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      repo.findByEmail.mockResolvedValue(mockUser as User);
      const result = await service.findByEmail('john@example.com');
      expect(repo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const result = await service.findByEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password comparison', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validatePassword('plain', 'hashed');
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validatePassword('wrong', 'hashed');
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser as User];
      repo.findAll.mockResolvedValue(users);

      const result = await service.findAll();
      expect(repo.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
});
