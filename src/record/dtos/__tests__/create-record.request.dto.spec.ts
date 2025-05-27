import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRecordRequestDto } from '../create-record.request.dto';
import { RecordFormat, RecordCategory } from '../../../record/record.enum';

describe('CreateRecordRequestDto', () => {
  const validDto = {
    artist: 'The Beatles',
    album: 'Abbey Road',
    price: 30,
    qty: 10,
    format: RecordFormat.VINYL,
    category: RecordCategory.ROCK,
    mbid: 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d',
    tracklist: ['Track 1', 'Track 2'],
  };

  it('should validate a fully valid DTO', async () => {
    const instance = plainToInstance(CreateRecordRequestDto, validDto);
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    const instance = plainToInstance(CreateRecordRequestDto, {});
    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);

    const missingProps = errors.map((e) => e.property);
    expect(missingProps).toEqual(
      expect.arrayContaining([
        'artist',
        'album',
        'price',
        'qty',
        'format',
        'category',
      ]),
    );
  });

  it('should fail if price or qty is out of range', async () => {
    const instance = plainToInstance(CreateRecordRequestDto, {
      ...validDto,
      price: -1,
      qty: 200,
    });
    const errors = await validate(instance);
    const errorProps = errors.map((e) => e.property);
    expect(errorProps).toContain('price');
    expect(errorProps).toContain('qty');
  });

  it('should fail if tracklist is not an array of strings', async () => {
    const instance = plainToInstance(CreateRecordRequestDto, {
      ...validDto,
      tracklist: [123, true],
    });
    const errors = await validate(instance);
    expect(errors.some((e) => e.property === 'tracklist')).toBe(true);
  });

  it('should validate successfully without optional fields', async () => {
    const instance = plainToInstance(CreateRecordRequestDto, validDto);
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
