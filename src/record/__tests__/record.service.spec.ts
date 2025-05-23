import * as fs from 'fs';
import * as path from 'path';
import { CacheService } from 'src/shared/cache.service';
import { RecordService } from '../record.service';
import { RecordRepository } from '../record.repository';
import { MusicbrainzService } from '../musicbrainz.service';
import { FilterRecordsQueryDto } from '../dtos/filter-records.query.dto';
import { Record } from '../record.schema';
import { Logger } from '@nestjs/common';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';

const loadFixture = (name: string): Record[] =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8'));

describe('RecordService', () => {
  let service: RecordService;
  let recordRepo: jest.Mocked<RecordRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let musicbrainzService: jest.Mocked<MusicbrainzService>;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    recordRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      clearByPrefix: jest.fn(),
      clear: jest.fn(),
    } as any;

    musicbrainzService = {
      fetchTracklistByMbid: jest.fn(),
    } as any;

    service = new RecordService(recordRepo, cacheService, musicbrainzService);

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const query: FilterRecordsQueryDto = { page: 1, limit: 10 };

    it('should return cached records if available', async () => {
      const cachedResult = {
        data: [{ id: '1', title: 'Cached Record' }],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      cacheService.get.mockReturnValue(cachedResult);

      const result = await service.findAll(query);
      expect(cacheService.get).toHaveBeenCalledWith(
        `records::${JSON.stringify(query)}`,
      );
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(recordRepo.findAll).not.toHaveBeenCalled();
      expect(result).toBe(cachedResult);
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Cache hit for query',
        `RecordService.findAll: ${JSON.stringify(query)}`,
      );
    });

    it('should fetch records and cache them if not cached', async () => {
      cacheService.get.mockReturnValue(undefined);
      const records = loadFixture('records-array.json');
      recordRepo.findAll.mockResolvedValue([records, records.length]);

      const result = await service.findAll(query);
      expect(cacheService.get).toHaveBeenCalledWith(
        `records::${JSON.stringify(query)}`,
      );
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(records);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);

      expect(cacheService.set).toHaveBeenCalledWith(
        `records::${JSON.stringify(query)}`,
        result,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Fetching records for query',
        `RecordService.findAll: ${JSON.stringify(query)}`,
      );
      expect(recordRepo.findAll).toHaveBeenCalledWith(query);
      expect(recordRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should set page and limit to defaults if not provided', async () => {
      const defaultQuery: FilterRecordsQueryDto = {};
      cacheService.get.mockReturnValue(undefined);
      const records = loadFixture('records-array.json');
      recordRepo.findAll.mockResolvedValue([records, records.length]);
      const result = await service.findAll(defaultQuery);
      expect(cacheService.get).toHaveBeenCalledWith(
        `records::${JSON.stringify(defaultQuery)}`,
      );
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(records);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(cacheService.set).toHaveBeenCalledWith(
        `records::${JSON.stringify(defaultQuery)}`,
        result,
      );
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'Fetching records for query',
        `RecordService.findAll: ${JSON.stringify(defaultQuery)}`,
      );
      expect(recordRepo.findAll).toHaveBeenCalledWith({});
      expect(recordRepo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      recordRepo.findAll.mockRejectedValue(error);
      await expect(service.findAll(query)).rejects.toThrow(
        'Failed to fetch records. Please try again later.',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch records: Database error',
        error.stack,
        `RecordService.findAll: ${JSON.stringify(query)}`,
      );
      expect(cacheService.get).toHaveBeenCalledWith(
        `records::${JSON.stringify(query)}`,
      );
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(recordRepo.findAll).toHaveBeenCalledWith(query);
      expect(recordRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new record and clear cache', async () => {
      const createPayload = {
        artist: 'Test',
        album: 'Test',
        price: 233.33,
        qty: 5,
        format: 'CD',
        category: 'Jazz',
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
      };
      const tracklist = ['Track 1', 'Track 2'];
      musicbrainzService.fetchTracklistByMbid.mockResolvedValue(tracklist);

      const createdRecord = {
        _id: '683164229ad3a9471755bc87',
        ...createPayload,
        tracklist,
      };

      recordRepo.create.mockResolvedValue(createdRecord as Record);

      const result = await service.create(
        createPayload as CreateRecordRequestDto,
      );

      expect(recordRepo.create).toHaveBeenCalledWith({
        ...createPayload,
        tracklist,
      });
      expect(result).toEqual(createdRecord);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('records::');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Record created successfully with id ${createdRecord._id}`,
        `RecordService.create: ${JSON.stringify(createPayload)}`,
      );
      expect(musicbrainzService.fetchTracklistByMbid).toHaveBeenCalledWith(
        createPayload.mbid,
      );
      expect(musicbrainzService.fetchTracklistByMbid).toHaveBeenCalledTimes(1);
    });

    it('should create a record without MBID and empty tracklist', async () => {
      const createPayload = {
        artist: 'Test Artist',
        album: 'Test Album',
        price: 100,
        qty: 10,
        format: 'VINYL',
        category: 'ALTERNATIVE',
      };
      const tracklist: string[] = [];
      musicbrainzService.fetchTracklistByMbid.mockResolvedValue(tracklist);
      const createdRecord = {
        _id: '683164229ad3a9471755bc88',
        ...createPayload,
        tracklist,
      };
      recordRepo.create.mockResolvedValue(createdRecord as Record);
      const result = await service.create(
        createPayload as CreateRecordRequestDto,
      );
      expect(recordRepo.create).toHaveBeenCalledWith({
        ...createPayload,
        tracklist,
      });
      expect(result).toEqual(createdRecord);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('records::');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Record created successfully with id ${createdRecord._id}`,
        `RecordService.create: ${JSON.stringify(createPayload)}`,
      );
      expect(musicbrainzService.fetchTracklistByMbid).not.toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      const createPayload = {
        artist: 'Test Artist',
        album: 'Test Album',
        price: 100,
        qty: 10,
        format: 'VINYL',
        category: 'ALTERNATIVE',
      };
      const error = new Error('Database Create error');
      recordRepo.create.mockRejectedValue(error);
      musicbrainzService.fetchTracklistByMbid.mockResolvedValue([]);

      await expect(
        service.create(createPayload as CreateRecordRequestDto),
      ).rejects.toThrow('Failed to create record. Please try again later.');
      expect(recordRepo.create).toHaveBeenCalledWith({
        ...createPayload,
        tracklist: [],
      });

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to create record: Database Create error',
        error.stack,
        `RecordService.create: ${JSON.stringify(createPayload)}`,
      );
    });
  });

  describe('update', () => {
    it('should update an existing record and clear cache', async () => {
      const id = '683164229ad3a9471755bc87';
      const updatePayload = {
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
      } as UpdateRecordRequestDto;

      const tracklist = ['Updated Track 1', 'Updated Track 2'];
      musicbrainzService.fetchTracklistByMbid.mockResolvedValue(tracklist);

      const existingRecord = {
        _id: id,
        artist: 'Old Artist',
        album: 'Old Album',
        price: 100,
        qty: 10,
        format: 'VINYL',
        category: 'ROCK',
        tracklist: [],
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d1',
        toObject: () => ({}),
      };

      recordRepo.findById.mockResolvedValue(existingRecord as Record);
      recordRepo.update.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      });

      const result = await service.update(id, updatePayload);

      expect(recordRepo.findById).toHaveBeenCalledWith(id);
      expect(recordRepo.update).toHaveBeenCalledWith(id, {
        ...updatePayload,
        tracklist,
      });
      expect(result).toEqual({
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        tracklist: ['Updated Track 1', 'Updated Track 2'],
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
      });
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('records::');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Record updated successfully with id ${id}`,
        `RecordService.update: ${id} - ${JSON.stringify(updatePayload)}`,
      );
      expect(musicbrainzService.fetchTracklistByMbid).toHaveBeenCalledWith(
        updatePayload.mbid,
      );
      expect(musicbrainzService.fetchTracklistByMbid).toHaveBeenCalledTimes(1);
    });

    it('should update record with existing tracklist if mbid is unchanged', async () => {
      const id = '683164229ad3a9471755bc87';
      const updatePayload = {
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d1', // Same MBID as existing record
      } as UpdateRecordRequestDto;

      const existingTracklist = ['Existing Track 1', 'Existing Track 2'];
      const existingRecord = {
        _id: id,
        artist: 'Old Artist',
        album: 'Old Album',
        price: 100,
        qty: 10,
        format: 'VINYL',
        category: 'ROCK',
        tracklist: existingTracklist,
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d1',
        toObject: () => ({}),
      };

      recordRepo.findById.mockResolvedValue(existingRecord as Record);
      recordRepo.update.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      });

      const result = await service.update(id, updatePayload);

      expect(recordRepo.findById).toHaveBeenCalledWith(id);
      expect(recordRepo.update).toHaveBeenCalledWith(id, {
        ...updatePayload,
        tracklist: existingTracklist,
      });
      expect(result).toEqual({
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        tracklist: ['Existing Track 1', 'Existing Track 2'],
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d1',
      });
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('records::');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Record updated successfully with id ${id}`,
        `RecordService.update: ${id} - ${JSON.stringify(updatePayload)}`,
      );
      expect(musicbrainzService.fetchTracklistByMbid).not.toHaveBeenCalled();
    });

    it('should throw if record is not found', async () => {
      recordRepo.findById.mockResolvedValueOnce(null);

      const id = 'nonexistent-id';
      const updatePayload = {
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
      } as UpdateRecordRequestDto;
      await expect(service.update(id, updatePayload)).rejects.toThrow(
        'Record with id nonexistent-id not found!!',
      );
      expect(recordRepo.findById).toHaveBeenCalledWith(id);
      expect(cacheService.clearByPrefix).not.toHaveBeenCalled();
      expect(recordRepo.update).not.toHaveBeenCalled();
    });

    it('should handle errors during update', async () => {
      const id = '683164229ad3a9471755bc87';
      const updatePayload = {
        artist: 'Updated Artist',
        album: 'Updated Album',
        price: 150,
        qty: 20,
        format: 'CD',
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
      } as UpdateRecordRequestDto;

      const error = new Error('Database Update error');
      recordRepo.findById.mockResolvedValue({
        _id: id,
        artist: 'Old Artist',
        album: 'Old Album',
        price: 100,
        qty: 10,
        tracklist: [],
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d0',
        toObject: () => ({}),
      } as Record);
      recordRepo.update.mockRejectedValue(error);

      await expect(service.update(id, updatePayload)).rejects.toThrow(
        'Failed to update record. Please try again later.',
      );
      expect(recordRepo.findById).toHaveBeenCalledWith(id);
      expect(recordRepo.update).toHaveBeenCalledWith(id, {
        ...updatePayload,
        tracklist: [],
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to update record: Database Update error',
        error.stack,
        `RecordService.update: ${id} - ${JSON.stringify(updatePayload)}`,
      );
    });
  });

  describe('delete', () => {
    it('should call repository delete', async () => {
      const id = '683164229ad3a9471755bc87';
      const deletedRecord = {
        _id: id,
        artist: 'Old Artist',
        album: 'Old Album',
        price: 100,
        qty: 10,
        tracklist: [],
        mbid: 'bc4baec2-c50b-4958-b2c9-8c184dd6e9d1',
      } as Record;
      recordRepo.delete.mockResolvedValue(deletedRecord);
      const result = await service.delete(id);
      expect(recordRepo.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(deletedRecord);
    });
  });
});
