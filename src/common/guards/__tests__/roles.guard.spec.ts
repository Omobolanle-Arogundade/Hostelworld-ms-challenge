import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { Role } from '../../../user/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockContext = (role: Role) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = mockContext(Role.USER);
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.USER]);
    const context = mockContext(Role.USER);
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = mockContext(Role.USER);
    const result = guard.canActivate(context);
    expect(result).toBe(false);
  });
});
