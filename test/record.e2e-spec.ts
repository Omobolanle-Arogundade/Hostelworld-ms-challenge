import * as request from 'supertest';
import { RecordFormat, RecordCategory } from '../src/record/record.enum';
import { getAccessToken, getAdminCredentials } from './utils/auth';
import { app } from './setup';

jest.mock('../src/record/musicbrainz.service');

let userAccessToken: string;
let adminAccessToken: string;

describe('RecordController (e2e)', () => {
  beforeAll(async () => {
    userAccessToken = await getAccessToken(app);
    adminAccessToken = await getAccessToken(app, getAdminCredentials());
  });

  const createRecordDto = {
    artist: 'The Beatles',
    album: 'Abbey Road',
    price: 25,
    qty: 10,
    format: RecordFormat.VINYL,
    category: RecordCategory.ROCK,
  };

  describe('POST /records', () => {
    it('should create a new record', async () => {
      const response = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createRecordDto)
        .expect(201);

      expect(response.body).toHaveProperty('artist', 'The Beatles');
      expect(response.body).toHaveProperty('album', 'Abbey Road');
    });

    it('should not allow a regular user to create a record', async () => {
      const response = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(createRecordDto)
        .expect(403);

      expect(response.body).toHaveProperty('statusCode', 403);
      expect(response.body).toHaveProperty('message', 'Forbidden resource');
    });

    it('should not allow an unauthenticated user to create a record', async () => {
      const response = await request(app.getHttpServer())
        .post('/records')
        .send(createRecordDto)
        .expect(401);
      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should validate the request body', async () => {
      const invalidRecordDto = { ...createRecordDto, price: -10 };
      const response = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidRecordDto)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('price must not be less than 0');
    });
  });

  describe('GET /records', () => {
    it('should retrieve all records', async () => {
      const response = await request(app.getHttpServer())
        .get('/records')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/records?page=1&limit=5')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('totalPages');
      expect(response.body.meta.totalPages).toBeGreaterThan(0);
    });

    it('should retrieve records without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/records')
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter records by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/records?category=Rock')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((record) => {
        expect(record.category).toBe(RecordCategory.ROCK);
      });
    });

    it('should filter records by format', async () => {
      const response = await request(app.getHttpServer())
        .get('/records?format=Vinyl')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((record) => {
        expect(record.format).toBe(RecordFormat.VINYL);
      });
    });
  });

  describe('PUT /records/:id', () => {
    it('should update an existing record', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createRecordDto)
        .expect(201);

      const recordId = createResponse.body._id;

      const updateDto = { price: 30, qty: 5 };
      const response = await request(app.getHttpServer())
        .put(`/records/${recordId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('price', 30);
      expect(response.body).toHaveProperty('qty', 5);
    });

    it('should not allow a regular user to update a record', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createRecordDto)
        .expect(201);

      const recordId = createResponse.body._id;

      const updateDto = { price: 30, qty: 5 };
      const response = await request(app.getHttpServer())
        .put(`/records/${recordId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateDto)
        .expect(403);

      expect(response.body).toHaveProperty('statusCode', 403);
      expect(response.body).toHaveProperty('message', 'Forbidden resource');
    });

    it('should not allow an unauthenticated user to update a record', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createRecordDto)
        .expect(201);

      const recordId = createResponse.body._id;

      const updateDto = { price: 30, qty: 5 };
      const response = await request(app.getHttpServer())
        .put(`/records/${recordId}`)
        .send(updateDto)
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should validate the update request body', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/records')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createRecordDto)
        .expect(201);

      const recordId = createResponse.body._id;

      const invalidUpdateDto = { price: -10 };
      const response = await request(app.getHttpServer())
        .put(`/records/${recordId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('price must not be less than 0');
    });

    it('should return 404 for non-existent record', async () => {
      const recordId = '68377641c7e26b75857cb2cd';
      const response = await request(app.getHttpServer())
        .put(`/records/${recordId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ price: 30, qty: 5 })
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty(
        'message',
        `Record with id ${recordId} not found!!`,
      );
    });
  });
});
