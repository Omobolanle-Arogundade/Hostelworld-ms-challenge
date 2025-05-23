import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordRepository } from './record.repository';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { Record } from './record.schema';
import { CreateRecordRequestDto } from './dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from './dtos/update-record.request.dto';
import { CacheService } from '../shared/cache.service';

@Injectable()
export class RecordService {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   *
   * @param query Filter records query
   * @returns Paginated response of records
   * @description This method retrieves all records based on the provided query parameters.
   * It also supports pagination through the page and limit parameters.
   */
  async findAll(
    query: FilterRecordsQueryDto,
  ): Promise<PaginatedResponseDto<Record>> {
    const cacheKey = JSON.stringify(query);

    const cached =
      this.cacheService.get<PaginatedResponseDto<Record>>(cacheKey);

    if (cached) {
      return cached;
    }

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
   */
  async create(payload: CreateRecordRequestDto): Promise<Record> {
    const record = await this.recordRepo.create(payload);
    this.cacheService.clear();
    return record;
  }

  /**
   * @param id id of the record to update
   * @param data Data to update
   * @description This method updates an existing record in the database.
   * @returns The updated record
   * @throws NotFoundException if the record is not found
   */

  async update(id: string, payload: UpdateRecordRequestDto) {
    const existing = await this.recordRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }
    await this.recordRepo.update(id, payload);
    this.cacheService.clear();
    return { ...existing.toObject(), ...payload };
  }

  /**
   * @param id id of the record to delete
   * @description This method deletes a record from the database.
   */
  async delete(id: string) {
    return this.recordRepo.delete(id);
  }
}
