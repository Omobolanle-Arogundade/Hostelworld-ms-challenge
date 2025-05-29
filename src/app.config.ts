import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.resolve(__dirname, '../.env.test')
      : undefined,
});

interface AppConfig {
  mongoUrl: string;
  port: number | string;
  author: {
    name: string;
    email: string;
  };
  adminUiUrl: string;
  jwtSecret?: string;
  redis: {
    host: string;
    port: number;
  };
}

export const AppConfig: AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  author: {
    name: process.env.AUTHOR_NAME || 'Default Author',
    email: process.env.AUTHOR_EMAIL || 'default@email.com',
  },
  adminUiUrl: process.env.ADMIN_UI_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};
