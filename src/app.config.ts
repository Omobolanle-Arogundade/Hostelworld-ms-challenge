import * as dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
  mongoUrl: string;
  port: number | string;
  author: {
    name: string;
    email: string;
  };
  adminUiUrl: string;
  jwtSecret?: string;
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
};
