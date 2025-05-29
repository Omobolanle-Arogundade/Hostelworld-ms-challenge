import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../user/enums/role.enum';
import { User } from '../../user/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    _id: 'user123',
    email: 'user@example.com',
    name: 'Jane Doe',
    role: Role.USER,
    password: 'hashedPass',
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: 'CacheInterface',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            clearByPrefix: jest.fn(),
            clearAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should return access_token if login succeeds', async () => {
      const dto: LoginRequestDto = {
        email: 'user@example.com',
        password: 'validpassword',
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue({
        access_token: 'fake-token',
        user: mockUser,
      });

      const result = await controller.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ access_token: 'fake-token', user: mockUser });
    });

    it('should throw UnauthorizedException if login fails', async () => {
      const dto: LoginRequestDto = {
        email: 'wrong@example.com',
        password: 'badpassword',
      };

      authService.validateUser.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
