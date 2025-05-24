import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterRecordsQueryDto } from '../filter-records.query.dto';

describe('FilterRecordsQueryDto', () => {
  it('should transform page and limit to numbers', async () => {
    const plain = {
      page: '2',
      limit: '5',
    };

    const instance: FilterRecordsQueryDto = plainToInstance(
      FilterRecordsQueryDto,
      plain,
    );
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.page).toBe(2); // ✅ @Type() works
    expect(instance.limit).toBe(5);
  });

  it('should fail validation if page is not a number', async () => {
    const instance: FilterRecordsQueryDto = plainToInstance(
      FilterRecordsQueryDto,
      { page: 'abc' },
    );
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });
});
