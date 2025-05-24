import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from './record.schema';
import { Model } from 'mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRecordRequestDto } from './dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from './dtos/update-record.request.dto';
import { RecordService } from './record.service';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@ApiTags('Records')
@Controller('records')
export class RecordController {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly recordService: RecordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  async create(@Body() dto: CreateRecordRequestDto): Promise<Record> {
    return this.recordService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a record by ID' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateRecordRequestDto) {
    return this.recordService.update(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: [Record],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query() query: FilterRecordsQueryDto,
  ): Promise<PaginatedResponseDto<Record>> {
    return this.recordService.findAll(query);
  }
}
