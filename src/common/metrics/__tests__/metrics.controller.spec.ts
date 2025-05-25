import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from '../metrics.controller';
import { MetricsService } from '../metrics.service';
import { Response } from 'express';

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: MetricsService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockMetricsService = {
      getMetrics: jest.fn().mockResolvedValue('mock_metrics_data'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    metricsService = module.get<MetricsService>(MetricsService);

    mockResponse = {
      set: jest.fn(),
      send: jest.fn(),
    } as Partial<Response>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getMetrics and send response with correct headers and body', async () => {
    await controller.getMetrics(mockResponse as Response);

    expect(metricsService.getMetrics).toHaveBeenCalled();
    expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(mockResponse.send).toHaveBeenCalledWith('mock_metrics_data');
  });
});
