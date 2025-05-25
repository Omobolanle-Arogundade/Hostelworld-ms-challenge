import * as dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
  mongoUrl: string;
  port: number | string;
  author: {
    name: string;
    email: string;
  };
}

export const AppConfig: AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  author: {
    name: process.env.AUTHOR_NAME || 'Default Author',
    email: process.env.AUTHOR_EMAIL || 'default@email.com',
  },
};
