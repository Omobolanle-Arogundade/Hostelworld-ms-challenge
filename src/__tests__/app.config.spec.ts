jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('AppConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  it('should return mongoUrl from environment', async () => {
    process.env.MONGO_URL = 'mongodb://localhost:27017/test-db';
    const { AppConfig } = await import('../app.config');
    expect(AppConfig.mongoUrl).toBe('mongodb://localhost:27017/test-db');
  });

  it('should return default port if not set', async () => {
    const { AppConfig } = await import('../app.config');
    expect(AppConfig.port).toBe(3000);
  });

  it('should return port from environment if set', async () => {
    process.env.PORT = '8080';
    const { AppConfig } = await import('../app.config');
    expect(AppConfig.port).toBe('8080');
  });
});
