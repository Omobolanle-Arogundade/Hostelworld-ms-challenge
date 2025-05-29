import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordFormat, RecordCategory } from '../record.enum';
import { Type } from 'class-transformer';

export class UpdateRecordRequestDto {
  @ApiProperty({
    description: 'Artist of the record',
    example: 'The Beatles',
    required: false,
  })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiProperty({
    description: 'Album name',
    example: 'Abbey Road',
    required: false,
  })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiProperty({
    description: 'Price of the record',
    example: 30,
    minimum: 0,
    maximum: 10000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    description: 'Quantity of the record in stock',
    example: 10,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  qty?: number;

  @ApiProperty({
    description: 'Format of the record (Vinyl, CD, etc.)',
    enum: RecordFormat,
    example: RecordFormat.VINYL,
    required: false,
  })
  @IsEnum(RecordFormat)
  @IsOptional()
  format?: RecordFormat;

  @ApiProperty({
    description: 'Category or genre of the record (e.g., Rock, Jazz)',
    enum: RecordCategory,
    example: RecordCategory.ROCK,
    required: false,
  })
  @IsEnum(RecordCategory)
  @IsOptional()
  category?: RecordCategory;

  @ApiProperty({
    description: 'Musicbrainz identifier',
    example: 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d',
    required: false,
  })
  @IsOptional()
  @IsString()
  mbid?: string;
}
