import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { Role } from '../../../user/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockContext = (role?: Role): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  it('should allow public routes', () => {
    (reflector.get as jest.Mock).mockReturnValue(true); // IS_PUBLIC_KEY
    const context = mockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when no roles are required', () => {
    (reflector.get as jest.Mock).mockReturnValue(false);
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = mockContext(Role.USER);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(false);
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
    const context = mockContext(Role.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user lacks required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(false);
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
    const context = mockContext(Role.USER);
    expect(guard.canActivate(context)).toBe(false);
  });
});
