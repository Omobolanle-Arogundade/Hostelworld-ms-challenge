import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { Role } from '../../user/enums/role.enum';
import { User } from '../../user/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: 'abc123',
    email: 'user@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: Role.USER,
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if email and password are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(
        'user@example.com',
        'plainPassword',
      );

      expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(userService.validatePassword).toHaveBeenCalledWith(
        'plainPassword',
        mockUser.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(
        service.validateUser('user@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should sign and return a JWT token', async () => {
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      });
      expect(result).toEqual({
        access_token: 'signed-token',
        user: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });
  });
});
