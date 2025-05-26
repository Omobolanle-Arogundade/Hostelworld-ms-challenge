import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from './record.schema';
import { Model } from 'mongoose';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateRecordRequestDto } from './dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from './dtos/update-record.request.dto';
import { RecordService } from './record.service';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';
import { PaginatedResponseDto } from '../shared/dtos/paginated-response.dto';
import { RecordCategory, RecordFormat } from './record.enum';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../common/guards/custom-throttler.guard';

@ApiTags('Records')
@Controller('records')
export class RecordController {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly recordService: RecordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiBody({ type: CreateRecordRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    type: Record,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateRecordRequestDto): Promise<Record> {
    return this.recordService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the record to update' })
  @ApiBody({ type: UpdateRecordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    type: Record,
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateRecordRequestDto) {
    return this.recordService.update(id, dto);
  }

  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get()
  @ApiOperation({
    summary: 'Get all records with optional filters and pagination',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search query (artist, album, category)',
  })
  @ApiQuery({
    name: 'artist',
    required: false,
    type: String,
    description: 'Filter by artist name',
  })
  @ApiQuery({
    name: 'album',
    required: false,
    type: String,
    description: 'Filter by album name',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: RecordFormat,
    description: 'Record format (e.g., Vinyl, CD)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: RecordCategory,
    description: 'Record category (e.g., Rock, Jazz)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Pagination page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Pagination limit',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of records',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(
    @Query() query: FilterRecordsQueryDto,
  ): Promise<PaginatedResponseDto<Record>> {
    return this.recordService.findAll(query);
  }
}
