import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: Partial<ThrottlerLimitDetail>,
  ): Promise<void> {
    this.logger.warn(
      `Throttling limit reached: ${throttlerLimitDetail.limit} requests per ${throttlerLimitDetail.ttl} seconds`,
      CustomThrottlerGuard.name,
    );
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please slow down.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
