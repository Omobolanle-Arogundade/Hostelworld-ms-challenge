import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginRequestDto } from '../login-request.dto';

describe('LoginRequestDto', () => {
  it('should validate a correct email and password', async () => {
    const dto = plainToInstance(LoginRequestDto, {
      email: 'user@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is missing', async () => {
    const dto = plainToInstance(LoginRequestDto, {
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if email is invalid', async () => {
    const dto = plainToInstance(LoginRequestDto, {
      email: 'invalid-email',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if password is missing', async () => {
    const dto = plainToInstance(LoginRequestDto, {
      email: 'user@example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if password is too short', async () => {
    const dto = plainToInstance(LoginRequestDto, {
      email: 'user@example.com',
      password: '123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
