import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordSchema } from './record.schema';
import { RecordRepository } from './record.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
  ],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository],
})
export class RecordModule {}
