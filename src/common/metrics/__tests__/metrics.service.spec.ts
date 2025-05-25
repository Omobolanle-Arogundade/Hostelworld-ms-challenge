import { MetricsService } from '../metrics.service';
import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

jest.mock('prom-client', () => {
  const actual = jest.requireActual('prom-client');
  return {
    ...actual,
    collectDefaultMetrics: jest.fn(),
    Registry: jest.fn().mockImplementation(() => ({
      metrics: jest.fn().mockResolvedValue('mock_metrics_output'),
      registerMetric: jest.fn(),
    })),
    Counter: jest.fn().mockImplementation(() => ({
      inc: jest.fn(),
    })),
    Histogram: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      startTimer: jest.fn(() => jest.fn()),
    })),
  };
});

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
    service.onModuleInit();
  });

  it('should initialize registry and define httpRequestCounter and httpRequestDuration', () => {
    expect(service.httpRequestCounter).toBeDefined();
    expect(service.httpRequestDuration).toBeDefined();
  });

  it('should call collectDefaultMetrics with registry', () => {
    expect(collectDefaultMetrics).toHaveBeenCalledWith({
      register: expect.any(Object),
    });
  });

  it('should return metrics string from getMetrics()', async () => {
    const metrics = await service.getMetrics();
    expect(metrics).toBe('mock_metrics_output');
  });

  it('should register a histogram with correct properties', () => {
    const histogramInstance = service.httpRequestDuration;
    expect(histogramInstance).toBeDefined();
    expect(Histogram).toHaveBeenCalledWith({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [expect.any(Object)],
    });
  });

  it('should register a counter with correct properties', () => {
    const counterInstance = service.httpRequestCounter;
    expect(counterInstance).toBeDefined();
    expect(Counter).toHaveBeenCalledWith({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [expect.any(Object)],
    });
  });
});
