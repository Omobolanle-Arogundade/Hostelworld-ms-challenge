import { Model, Types } from 'mongoose';
import { RecordRepository } from '../record.repository';
import { Record } from '../record.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FilterRecordsQueryDto } from '../dtos/filter-records.query.dto';
import { RecordCategory, RecordFormat } from '../record.enum';

describe('RecordRepository', () => {
  let repository: RecordRepository;
  let model: jest.Mocked<Model<Record>>;

  const mockExec = jest.fn();
  const mockLean = jest.fn(() => ({ exec: mockExec }));

  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: mockLean,
    exec: mockExec,
  };

  beforeEach(async () => {
    model = {
      find: jest.fn().mockReturnValue(mockQuery),
      countDocuments: jest.fn(),
      create: jest.fn(),
      updateOne: jest
        .fn()
        .mockReturnValue({ lean: () => ({ exec: mockExec }) }),
      findById: jest.fn().mockReturnValue({ lean: () => ({ exec: mockExec }) }),
      findByIdAndDelete: jest
        .fn()
        .mockReturnValue({ lean: () => ({ exec: mockExec }) }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordRepository,
        { provide: getModelToken('Record'), useValue: model },
      ],
    }).compile();

    repository = module.get<RecordRepository>(RecordRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return filtered and paginated records', async () => {
      const query: FilterRecordsQueryDto = {
        q: 'test',
        page: 1,
        limit: 10,
      };

      const mockRecords = [{ artist: 'test' } as Record];

      mockQuery.exec.mockResolvedValueOnce(mockRecords);
      model.countDocuments.mockResolvedValueOnce(1);

      const [data, total] = await repository.findAll(query);
      const filterObj = {
        $or: [
          { artist: { $regex: 'test', $options: 'i' } },
          { album: { $regex: 'test', $options: 'i' } },
          { category: { $regex: 'test', $options: 'i' } },
        ],
      };
      expect(model.find).toHaveBeenCalledWith(filterObj);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.skip).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
      expect(mockQuery.exec).toHaveBeenLastCalledWith();
      expect(mockQuery.exec).toHaveBeenCalledTimes(1);
      expect(model.countDocuments).toHaveBeenCalledWith(filterObj);
      expect(data).toEqual(mockRecords);
      expect(total).toBe(1);
    });

    it('should filter by artist, album, category, and format', async () => {
      const query: FilterRecordsQueryDto = {
        artist: 'The Beatles',
        album: 'Abbey Road',
        category: RecordCategory.ROCK,
        format: RecordFormat.VINYL,
        page: 1,
        limit: 10,
      };

      const mockRecords = [
        { artist: 'The Beatles', album: 'Abbey Road' } as Record,
      ];
      mockQuery.exec.mockResolvedValueOnce(mockRecords);
      model.countDocuments.mockResolvedValueOnce(1);

      const [data, total] = await repository.findAll(query);
      const filterObj = {
        artist: new RegExp('The Beatles', 'i'),
        album: new RegExp('Abbey Road', 'i'),
        category: RecordCategory.ROCK,
        format: RecordFormat.VINYL,
      };

      expect(model.find).toHaveBeenCalledWith(filterObj);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.skip).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
      expect(mockQuery.exec).toHaveBeenLastCalledWith();
      expect(mockQuery.exec).toHaveBeenCalledTimes(1);
      expect(model.countDocuments).toHaveBeenCalledWith(filterObj);
      expect(data).toEqual(mockRecords);
      expect(total).toBe(1);
    });

    it('should handle empty query', async () => {
      const query: FilterRecordsQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockRecords = [{ artist: 'test' } as Record];
      mockQuery.exec.mockResolvedValueOnce(mockRecords);
      model.countDocuments.mockResolvedValueOnce(1);

      const [data, total] = await repository.findAll(query);
      expect(model.find).toHaveBeenCalledWith({});
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(data).toEqual(mockRecords);
      expect(total).toBe(1);
    });

    it('should handle pagination', async () => {
      const query: FilterRecordsQueryDto = {
        page: 2,
        limit: 5,
      };

      const mockRecords = [{ artist: 'test' } as Record];
      mockQuery.exec.mockResolvedValueOnce(mockRecords);
      model.countDocuments.mockResolvedValueOnce(10);

      const [data, total] = await repository.findAll(query);
      expect(model.find).toHaveBeenCalledWith({});
      expect(mockQuery.skip).toHaveBeenCalledWith(5);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(data).toEqual(mockRecords);
      expect(total).toBe(10);
    });

    it('should apply default pagination when page and limit are not provided', async () => {
      const query: FilterRecordsQueryDto = {
        artist: 'Sample Artist',
        album: 'Sample Album',
      };

      const expectedFilter = {
        artist: new RegExp('Sample Artist', 'i'),
        album: new RegExp('Sample Album', 'i'),
      };

      const mockRecords = [{ artist: 'Sample Artist' } as Record];

      const mockFindQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn(() => ({
          exec: jest.fn().mockResolvedValueOnce(mockRecords),
        })),
      };

      model.find.mockReturnValueOnce(mockFindQuery as any);
      model.countDocuments.mockResolvedValueOnce(1);

      const [data, total] = await repository.findAll(query);

      expect(model.find).toHaveBeenCalledWith(expectedFilter);
      expect(mockFindQuery.skip).toHaveBeenCalledWith(0); // page = 1
      expect(mockFindQuery.limit).toHaveBeenCalledWith(10); // limit = 10
      expect(data).toEqual(mockRecords);
      expect(total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const payload = {
        artist: 'Test Artist',
        album: 'Test Album',
        price: 20,
        qty: 5,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      };

      const createdRecord = { _id: '1', ...payload } as any;
      model.create.mockResolvedValue(createdRecord);

      const result = await repository.create(payload);
      expect(model.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdRecord);
    });
  });

  describe('update', () => {
    it('should call updateOne with given data and session', async () => {
      const id = new Types.ObjectId();
      const data = { artist: 'Updated' };
      mockExec.mockResolvedValueOnce(true);

      const result = await repository.update(id, data, 'session' as any);
      expect(model.updateOne).toHaveBeenCalledWith({ _id: id }, data, {
        session: 'session',
      });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('findById', () => {
    it('returns record by id', async () => {
      const id = new Types.ObjectId();
      const record = { artist: 'Some Artist' } as Record;
      mockExec.mockResolvedValueOnce(record);

      const result = await repository.findById(id);
      expect(result).toEqual(record);
      expect(model.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('delete', () => {
    it('deletes and returns record by id', async () => {
      const id = new Types.ObjectId();
      const record = { artist: 'Deleted Artist' } as Record;
      mockExec.mockResolvedValueOnce(record);

      const result = await repository.delete(id);
      expect(result).toEqual(record);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
    });
  });
});
