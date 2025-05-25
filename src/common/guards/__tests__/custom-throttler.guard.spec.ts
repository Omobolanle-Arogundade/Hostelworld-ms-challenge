import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CustomThrottlerGuard } from '../../guards/custom-throttler.guard';
import { ThrottlerLimitDetail } from '@nestjs/throttler';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;
  let mockLoggerWarn: jest.SpyInstance;

  beforeEach(() => {
    guard = new CustomThrottlerGuard(null, null, null);
    mockLoggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw a 429 HttpException with custom message', async () => {
    const context = {} as ExecutionContext;
    const limitDetail: Partial<ThrottlerLimitDetail> = { ttl: 60, limit: 5 };

    try {
      await guard['throwThrottlingException'](context, limitDetail);
    } catch (error) {
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Throttling limit reached: 5 requests per 60 seconds',
        'CustomThrottlerGuard',
      );
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(error.getResponse()).toEqual({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });
    }
  });
});
