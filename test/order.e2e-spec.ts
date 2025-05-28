import * as request from 'supertest';
import { getAccessToken, getAdminCredentials } from './utils/auth';
import { app } from './setup';
import { getRecordId } from './utils/record';
import { Types } from 'mongoose';

jest.mock('../src/record/musicbrainz.service');

let userAccessToken: string;
let adminAccessToken: string;
let recordId: Types.ObjectId;

describe('RecordController (e2e)', () => {
  beforeAll(async () => {
    userAccessToken = await getAccessToken(app);
    adminAccessToken = await getAccessToken(app, getAdminCredentials());
    recordId = await getRecordId();
  });

  describe('POST /orders', () => {
    it('should create an order for a user', async () => {
      const createOrderDto = {
        recordId,
        quantity: 1,
      };
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.recordId).toEqual(recordId.toString());
      expect(response.body.quantity).toEqual(createOrderDto.quantity);
    });

    it('should not allow creating an order with invalid recordId', async () => {
      const invalidDto = { recordId: 'invalid', quantity: 1 };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('recordId must be a mongodb id');
      expect(response.body.statusCode).toBe(400);
    });

    it('should not allow creating an order with quantity less than 1', async () => {
      const invalidDto = { recordId, quantity: 0 };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain(
        'quantity must not be less than 1',
      );
      expect(response.body.statusCode).toBe(400);
    });

    it('should not allow creating an order without authentication', async () => {
      const createOrderDto = {
        recordId,
        quantity: 1,
      };
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.statusCode).toBe(401);
    });

    it('should not allow creating an order with insufficient stock', async () => {
      const createOrderDto = {
        recordId,
        quantity: 1000, // Assuming stock is less than this
      };
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(createOrderDto)
        .expect(400);

      expect(response.body.message).toContain('Insufficient stock');
      expect(response.body.statusCode).toBe(400);
    });

    it('should not allow admin to create an order', async () => {
      const createOrderDto = {
        recordId,
        quantity: 1,
      };
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createOrderDto)
        .expect(403);
      expect(response.body.message).toBe('Forbidden resource');
      expect(response.body.statusCode).toBe(403);
    });
  });
});
