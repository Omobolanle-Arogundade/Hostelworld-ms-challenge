import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class MostOrderedRecordsDto {
  @ApiProperty({
    description: 'ID of the record being ordered',
    type: String,
    example: '60d5ec49f1b2c8a3f8e4b0a1',
    required: true,
  })
  @IsMongoId()
  recordId: Types.ObjectId;

  @ApiProperty({
    description: 'Total number of times the record has been ordered',
    type: Number,
    example: 150,
    required: true,
  })
  totalOrdered: number;

  @ApiProperty({
    description: 'Artist of the record',
    type: String,
    example: 'The Beatles',
    required: true,
  })
  artist: string;

  @ApiProperty({
    description: 'Album name of the record',
    type: String,
    example: 'Abbey Road',
    required: true,
  })
  album: string;
}
