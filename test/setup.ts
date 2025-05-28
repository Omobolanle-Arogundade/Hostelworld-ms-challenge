import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { seedDatabase } from './utils/seed';

let app: INestApplication;

beforeAll(async () => {
  process.env.NODE_ENV = 'test'; // Ensures test config is loaded

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  // Clean and seed
  await mongoose.connect(process.env.MONGO_URL!);
  await mongoose.connection.db.dropDatabase();
  await seedDatabase();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase(); // clean after tests
  await mongoose.disconnect();
  await app.close();
});

export { app };
