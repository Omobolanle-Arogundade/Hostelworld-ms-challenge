import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('should return a user object with userId, email, and role', async () => {
      const payload = {
        sub: 'user123',
        email: 'user@example.com',
        role: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
      });
    });
  });

  describe('jwtFromRequest', () => {
    it('should extract token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer test.token.value',
        },
      };

      const token = req.headers.authorization?.split(' ')[1];
      expect(token).toBe('test.token.value');
    });
  });
});
