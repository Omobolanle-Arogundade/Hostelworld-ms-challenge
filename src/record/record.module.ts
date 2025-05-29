import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordSchema } from './record.schema';
import { RecordRepository } from './record.repository';
import { MusicbrainzService } from './musicbrainz.service';
import { CacheModule } from '../common/cache/cache.module';
import { AxiosApiGateway } from '../common/http/axios-api-gateway.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
    CacheModule,
  ],
  controllers: [RecordController],
  providers: [
    RecordService,
    RecordRepository,
    MusicbrainzService,
    {
      provide: 'ApiGateway',
      useClass: AxiosApiGateway,
    },
  ],
  exports: [RecordRepository],
})
export class RecordModule {}
