import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from '../record.controller';
import { RecordService } from '../record.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { RecordCategory, RecordFormat } from '../record.enum';
import { Record } from '../record.schema';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { FilterRecordsQueryDto } from '../dtos/filter-records.query.dto';
import { PaginatedResponseDto } from '../../shared/dtos/paginated-response.dto';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthenticatedRequestDto } from '../../shared/dtos/authenticate-request.dto';
import { Types } from 'mongoose';

describe('RecordController', () => {
  let controller: RecordController;
  let service: jest.Mocked<RecordService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    controller = new RecordController(null, service);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60000,
              limit: 10,
            },
          ],
        }),
      ],
      controllers: [RecordController],
      providers: [
        {
          provide: getModelToken('Record'),
          useValue: {},
        },
        {
          provide: RecordService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to recordService.create', async () => {
      const payload: CreateRecordRequestDto = {
        artist: 'Test Artist',
        album: 'Test Album',
        price: 30,
        qty: 5,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
        mbid: 'some-mbid',
      };

      const req = {
        user: { userId: 'test-user-id' },
      } as any as AuthenticatedRequestDto;

      service.create.mockResolvedValue({
        _id: 'created-record-id',
        ...payload,
      } as Record);

      const result = await controller.create(payload, req);

      expect(service.create).toHaveBeenCalledWith({
        ...payload,
        createdBy: req.user.userId,
      });
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        _id: 'created-record-id',
        ...payload,
      });
    });
  });

  describe('update', () => {
    it('should delegate to recordService.update', async () => {
      const _id = new Types.ObjectId('68377c16a377ae53114d8b15');
      const payload: UpdateRecordRequestDto = {
        artist: 'Updated Artist',
      };
      service.update.mockResolvedValue({
        _id,
        artist: 'Updated Artist',
        album: 'Original Album',
        price: 30,
        qty: 5,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      } as Partial<Record>);

      const result = await controller.update(_id, payload);

      expect(service.update).toHaveBeenCalledWith(_id, payload);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        _id,
        artist: 'Updated Artist',
        album: 'Original Album',
        price: 30,
        qty: 5,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      });
    });
  });

  describe('findAll', () => {
    it('should delegate to recordService.findAll with correct query', async () => {
      const query: FilterRecordsQueryDto = {
        artist: 'Test Artist',
        album: 'Test Album',
        category: RecordCategory.ROCK,
        format: RecordFormat.VINYL,
        q: 'search term',
        page: 1,
        limit: 10,
      };

      const response = {
        data: [
          {
            _id: 'record1',
            artist: 'Test Artist',
            album: 'Test Album',
            price: 30,
            qty: 5,
            format: RecordFormat.VINYL,
            category: RecordCategory.ROCK,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      } as PaginatedResponseDto<Record>;

      service.findAll.mockResolvedValue(response);

      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(response);
    });
  });
});
