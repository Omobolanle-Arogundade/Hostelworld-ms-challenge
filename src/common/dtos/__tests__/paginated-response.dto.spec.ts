import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from '../paginated-response.dto';

describe('PaginatedResponseDto', () => {
  it('should create a valid DTO with data and meta', async () => {
    const input = {
      data: [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ],
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    const instance = plainToInstance(PaginatedResponseDto, input);

    expect(instance.data.length).toBe(2);
    expect(instance.meta.total).toBe(2);
    expect(instance.meta.page).toBe(1);
    expect(instance.meta.limit).toBe(10);
    expect(instance.meta.totalPages).toBe(1);
  });
});

describe('PaginationMetaDto', () => {
  it('should validate fields correctly', async () => {
    const input = {
      total: 100,
      page: 2,
      limit: 10,
      totalPages: 10,
    };

    const instance = plainToInstance(PaginationMetaDto, input);

    expect(instance.total).toBe(100);
    expect(instance.page).toBe(2);
    expect(instance.limit).toBe(10);
    expect(instance.totalPages).toBe(10);
  });
});
