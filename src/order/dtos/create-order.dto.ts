import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the record being ordered',
    type: String,
    example: '60d5ec49f1b2c8a3f8e4b0a1',
    required: true,
  })
  @IsMongoId()
  recordId: Types.ObjectId;

  @ApiProperty({
    description: 'Quantity of the record being ordered',
    type: Number,
    example: 2,
    required: true,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
