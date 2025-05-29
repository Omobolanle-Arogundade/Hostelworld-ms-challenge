import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { JwtStrategy } from '../jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: UserService,
          useValue: { findByEmail: jest.fn(), validatePassword: jest.fn() },
        },
      ],
    }).compile();
  });

  it('should compile the AuthModule', () => {
    expect(module).toBeDefined();
  });

  it('should resolve AuthService', () => {
    const authService = module.get(AuthService);
    expect(authService).toBeDefined();
  });

  it('should resolve AuthController', () => {
    const controller = module.get(AuthController);
    expect(controller).toBeDefined();
  });

  it('should resolve JwtStrategy', () => {
    const strategy = module.get(JwtStrategy);
    expect(strategy).toBeDefined();
  });
});
