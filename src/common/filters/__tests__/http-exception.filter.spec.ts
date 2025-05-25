import { HttpExceptionFilter } from '../http-exception.filter';
import {
  ArgumentsHost,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockHost: Partial<ArgumentsHost>;
  let spyErrorLogger: jest.SpyInstance;
  let spyWarnLogger: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    mockRequest = {
      method: 'GET',
      url: '/test/url',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;

    spyErrorLogger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    spyWarnLogger = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle HttpException properly', () => {
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Resource not found',
        path: '/test/url',
        timestamp: expect.any(String),
      }),
    );
    expect(spyErrorLogger).toHaveBeenCalledTimes(0);
    expect(spyWarnLogger).toHaveBeenCalledTimes(1);
  });

  it('should handle InternalServerErrorException with default message', () => {
    const exception = new InternalServerErrorException();

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal Server Error',
        path: '/test/url',
        timestamp: expect.any(String),
      }),
    );
    expect(spyErrorLogger).toHaveBeenCalledTimes(0);
    expect(spyWarnLogger).toHaveBeenCalledTimes(1);
  });

  it('should handle unknown error types as 500', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal Server Error',
        path: '/test/url',
        timestamp: expect.any(String),
      }),
    );

    expect(spyErrorLogger).toHaveBeenCalledTimes(1);
    expect(spyWarnLogger).toHaveBeenCalledTimes(0);
  });

  it('should extract message from exceptionResponse object', () => {
    const responseBody = { message: 'Validation failed' };
    const exception = new BadRequestException(responseBody);

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        path: '/test/url',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should handle string exceptionResponse', () => {
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        path: '/test/url',
        timestamp: expect.any(String),
      }),
    );
  });
});
