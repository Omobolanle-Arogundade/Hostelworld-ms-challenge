import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordCategory, RecordFormat } from '../record.enum';
import { Type } from 'class-transformer';

export class FilterRecordsQueryDto {
  @ApiProperty({
    description: 'General search query (matches artist, album, or category)',
    example: 'Jazz',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Filter by artist name',
    example: 'The Beatles',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({
    description: 'Filter by album name',
    example: 'Abbey Road',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  album?: string;

  @ApiProperty({
    description: 'Filter by record format',
    enum: RecordFormat,
    example: RecordFormat.VINYL,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsEnum(RecordFormat)
  format?: RecordFormat;

  @ApiProperty({
    description: 'Filter by record category',
    enum: RecordCategory,
    example: RecordCategory.ROCK,
    required: false,
    type: String,
  })
  @IsOptional()
  @IsEnum(RecordCategory)
  category?: RecordCategory;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
