import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;
    guard = new JwtAuthGuard(reflector);
  });

  const mockExecutionContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
    }) as any;

  it('should allow access if route is public', () => {
    (reflector.get as jest.Mock).mockReturnValue(true);
    const context = mockExecutionContext();
    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflector.get).toHaveBeenCalled();
  });

  it('should delegate to super.canActivate if route is not public', () => {
    (reflector.get as jest.Mock).mockReturnValue(false);
    const context = mockExecutionContext();

    const superCanActivateSpy = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockReturnValue(true as any);

    const result = guard.canActivate(context);
    expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });
});
