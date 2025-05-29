import * as request from 'supertest';
import { app } from './setup';
import { LoginRequestDto } from '../src/auth/dto/login-request.dto';
import { data } from '../data';

describe('AuthController (e2e)', () => {
  const [admin, user] = data.users;
  const validUserCredentials = admin;
  const validAdminCredentials = user;

  it('should login successfully with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: validUserCredentials.email,
        password: validUserCredentials.password,
      } as LoginRequestDto)
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(typeof response.body.access_token).toBe('string');
  });

  it('should login successfully with admin credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: validAdminCredentials.email,
        password: validAdminCredentials.password,
      } as LoginRequestDto)
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).toHaveProperty(
      'email',
      validAdminCredentials.email,
    );
    expect(typeof response.body.access_token).toBe('string');
  });

  it('should fail login with invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: validUserCredentials.email,
        password: 'wrongpass',
      } as LoginRequestDto)
      .expect(401);
  });

  it('should fail login with non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@email.com', password: 'somepass' })
      .expect(401);
  });
});
