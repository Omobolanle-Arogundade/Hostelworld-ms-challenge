import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { MetricsService } from '../metrics.service';
import { MetricsInterceptor } from '../metrics.interceptor';

import { Request, Response } from 'express';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;
  let metricsService: Partial<MetricsService>;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  const mockEndTimer = jest.fn();

  const createMockContext = (requestOverride: Partial<Request>) => {
    const mockRequest: Partial<Request> = {
      method: 'GET',
      url: '/fallback-url',
      ...requestOverride,
    };

    const mockResponse: Partial<Response> = {
      statusCode: 200,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as Partial<ExecutionContext>;
  };

  beforeEach(() => {
    metricsService = {
      httpRequestDuration: {
        startTimer: jest.fn().mockReturnValue(mockEndTimer),
      } as any,
      httpRequestCounter: {
        inc: jest.fn(),
      } as any,
    };

    interceptor = new MetricsInterceptor(metricsService as MetricsService);

    const mockRequest: Partial<Request> = {
      method: 'GET',
      route: { path: '/test' } as any,
    };

    mockExecutionContext = createMockContext(mockRequest);

    mockCallHandler = {
      handle: () => of('test-response'),
    };
  });

  it('should collect and record metrics for HTTP requests', (done) => {
    const result$ = interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    result$.subscribe((res) => {
      expect(metricsService.httpRequestDuration.startTimer).toHaveBeenCalled();
      expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith({
        method: 'GET',
        route: '/test',
        status: '200',
      });
      expect(mockEndTimer).toHaveBeenCalledWith({
        method: 'GET',
        route: '/test',
        status: '200',
      });
      expect(res).toBe('test-response');
      done();
    });
  });

  it('should use route.path if defined', (done) => {
    mockExecutionContext = createMockContext({
      route: { path: '/test-path' },
    });
    mockCallHandler = {
      handle: () => of('test-response'),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe(() => {
        expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
          expect.objectContaining({ route: '/test-path' }),
        );
        done();
      });
  });

  it('should fallback to request.url if no route path info exists', (done) => {
    mockExecutionContext = createMockContext({
      route: undefined,
      url: '/final-fallback',
    });
    mockCallHandler = {
      handle: () => of('final-response'),
    };

    interceptor
      .intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe(() => {
        expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
          expect.objectContaining({ route: '/final-fallback' }),
        );
        done();
      });
  });
});
