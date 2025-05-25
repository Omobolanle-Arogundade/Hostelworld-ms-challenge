import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const method = request.method;
    const url = request.url;

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal Server Error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message || exceptionResponse;

    const responseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: url,
    };

    const logContext = `${method} ${url} [${status}]`;

    if (isHttpException) {
      this.logger.warn(JSON.stringify(responseBody), logContext);
    } else {
      this.logger.error(
        (exception as Error).message,
        (exception as Error).stack,
        logContext,
      );
    }

    response.status(status).json(responseBody);
  }
}
