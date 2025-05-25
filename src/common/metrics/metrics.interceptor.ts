import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, route } = request;
    const routePath = route?.path || request.route?.path || request.url;

    const endTimer = this.metricsService.httpRequestDuration.startTimer();

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;

        this.metricsService.httpRequestCounter.inc({
          method,
          route: routePath,
          status: statusCode.toString(),
        });

        endTimer({
          method,
          route: routePath,
          status: statusCode.toString(),
        });
      }),
    );
  }
}
