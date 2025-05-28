// test/utils/auth.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { data } from '../../data';

interface LoginResponse {
  access_token: string;
}

const [admin, user] = data.users;
const users = { admin, user };

/**
 * Logs in a user and returns the JWT access token.
 * @param app - The NestJS app instance.
 * @param credentials - The login credentials to use.
 */
export const getAccessToken = async (
  app: INestApplication,
  credentials: { email: string; password: string } = getUserCredentials(),
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials)
    .expect(200);

  const data: LoginResponse = response.body;
  return data.access_token;
};

/**
 * Returns default login credentials for the admin user.
 */
export const getAdminCredentials = () => {
  const {
    admin: { email, password },
  } = users;
  return { email, password };
};

/**
 * Returns default login credentials for a regular user.
 */
export const getUserCredentials = () => {
  const {
    user: { email, password },
  } = users;
  return { email, password };
};
