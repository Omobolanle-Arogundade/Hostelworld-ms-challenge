import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from '../create-order.dto';

describe('CreateOrderDto', () => {
  it('should validate a correct payload', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      recordId: '60d5ec49f1b2c8a3f8e4b0a1',
      quantity: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if recordId is not a valid Mongo ID', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      recordId: 'invalid-id',
      quantity: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recordId');
  });

  it('should fail if quantity is missing or less than 1', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      recordId: '60d5ec49f1b2c8a3f8e4b0a1',
      quantity: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
  });
});
