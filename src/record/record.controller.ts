import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from './record.schema';
import { Model, Types } from 'mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateRecordRequestDto } from './dtos/update-record.request.dto';
import { RecordService } from './record.service';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';
import { PaginatedResponseDto } from '../shared/dtos/paginated-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { AuthenticatedRequestDto } from '../shared/dtos/authenticate-request.dto';
import { CreateRecordRequestDto } from './dtos/create-record.request.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Records')
@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordController {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    private readonly recordService: RecordService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  async create(
    @Body() dto: CreateRecordRequestDto,
    @Req() req: AuthenticatedRequestDto,
  ): Promise<Record> {
    return this.recordService.create({ ...dto, createdBy: req.user['userId'] });
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a record by ID' })
  @ApiResponse({ status: 200, description: 'Record updated successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() dto: UpdateRecordRequestDto,
  ) {
    return this.recordService.update(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @Public()
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
