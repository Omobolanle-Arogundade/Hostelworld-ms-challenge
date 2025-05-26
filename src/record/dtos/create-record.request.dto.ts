import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordFormat, RecordCategory } from '../record.enum';
import { Type } from 'class-transformer';

export class CreateRecordRequestDto {
  @ApiProperty({
    description: 'Artist of the record',
    type: String,
    example: 'The Beatles',
  })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty({
    description: 'Album name',
    type: String,
    example: 'Abbey Road',
  })
  @IsString()
  @IsNotEmpty()
  album: string;

  @ApiProperty({
    description: 'Price of the record',
    type: Number,
    example: 30,
    minimum: 0,
    maximum: 10000,
  })
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Quantity of the record in stock',
    type: Number,
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  qty: number;

  @ApiProperty({
    description: 'Format of the record (Vinyl, CD, etc.)',
    enum: RecordFormat,
    example: RecordFormat.VINYL,
    required: true,
  })
  @IsEnum(RecordFormat)
  @IsNotEmpty()
  format: RecordFormat;

  @ApiProperty({
    description: 'Genre or category of the record',
    enum: RecordCategory,
    example: RecordCategory.ROCK,
    required: true,
  })
  @IsEnum(RecordCategory)
  @IsNotEmpty()
  category: RecordCategory;

  @ApiProperty({
    description: 'Musicbrainz identifier',
    example: 'b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d',
    required: false,
  })
  @IsOptional()
  @IsString()
  mbid?: string;

  @ApiProperty({
    description: 'Tracklist of the record',
    type: [String],
    example: ['Come Dance', 'Level Up', 'Dancing Dragons'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracklist?: string[];
}
