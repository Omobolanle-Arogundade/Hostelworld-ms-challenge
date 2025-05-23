// src/record/dtos/filter-records.query.dto.ts
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { RecordCategory, RecordFormat } from '../record.enum';
import { Type } from 'class-transformer';

export class FilterRecordsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsOptional()
  @IsEnum(RecordFormat)
  format?: RecordFormat;

  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
