import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RecordRepository } from './record.repository';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';
import { PaginatedResponseDto } from '../shared/dtos/paginated-response.dto';
import { Record } from './record.schema';
import { UpdateRecordRequestDto } from './dtos/update-record.request.dto';
import { CacheService } from '../shared/cache.service';
import { MusicbrainzService } from './musicbrainz.service';
import { Types } from 'mongoose';
import { CreateRecordPayloadDto } from './dtos/create-record.payload.dto';

@Injectable()
export class RecordService {
  private readonly logger: Logger = new Logger(RecordService.name);

  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly cacheService: CacheService,
    private readonly musicbrainz: MusicbrainzService,
  ) {}

  /**
   *
   * @param query Filter records query
   * @returns Paginated response of records
   * @description This method retrieves all records based on the provided query parameters.
   * It also supports pagination through the page and limit parameters.
   * @throws InternalServerErrorException if there is an error during the retrieval
   */
  async findAll(
    query: FilterRecordsQueryDto,
  ): Promise<PaginatedResponseDto<Record>> {
    const ctx = `RecordService.findAll: ${JSON.stringify(query)}`;
    const cacheKey = `records::${JSON.stringify(query)}`;

    const cached =
      this.cacheService.get<PaginatedResponseDto<Record>>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for query`, ctx);
      return cached;
    }

    this.logger.debug(`Fetching records for query`, ctx);

    const [data, total] = await this.recordRepo.findAll(query);

    const result = {
      data,
      meta: {
        total,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        totalPages: Math.ceil(total / (query.limit ?? 10)),
      },
    };

    this.cacheService.set(cacheKey, result);

    return result;
  }

  /**
   * @param payload Record payload
   * @description This method creates a new record in the database.
   * @returns The created record
   * @throws InternalServerErrorException if there is an error during the creation
   */
  async create(payload: CreateRecordPayloadDto): Promise<Record> {
    const ctx = `RecordService.create: ${JSON.stringify(payload)}`;
    const tracklist = payload.mbid
      ? await this.musicbrainz.fetchTracklistByMbid(payload.mbid)
      : [];

    const record = await this.recordRepo.create({
      ...payload,
      tracklist,
      createdBy: new Types.ObjectId(payload.createdBy),
    });

    this.logger.log(`Record created successfully with id ${record._id}`, ctx);
    this.cacheService.clearByPrefix('records::'); // Clear records cache after creation
    return record;
  }

  /**
   * @param id id of the record to update
   * @param data Data to update
   * @description This method updates an existing record in the database.
   * @returns The updated record
   * @throws NotFoundException if the record is not found
   * @throws InternalServerErrorException if there is an error during the update
   */
  async update(id: Types.ObjectId, payload: UpdateRecordRequestDto) {
    const ctx = `RecordService.update: ${id} - ${JSON.stringify(payload)}`;
    const existing = await this.recordRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Record with id ${id} not found!!`);
    }

    let tracklist = existing.tracklist;

    if (payload.mbid && payload.mbid !== existing.mbid) {
      tracklist = await this.musicbrainz.fetchTracklistByMbid(payload.mbid);
    }

    await this.recordRepo.update(id, { ...payload, tracklist });
    this.logger.log(`Record updated successfully with id ${id}`, ctx);
    this.cacheService.clearByPrefix('records::'); // Clear records cache after update
    return { ...existing.toObject(), ...payload, tracklist };
  }

  /**
   * @param id id of the record to delete
   * @description This method deletes a record from the database.
   */
  async delete(id: Types.ObjectId): Promise<Record | null> {
    return this.recordRepo.delete(id);
  }
}
