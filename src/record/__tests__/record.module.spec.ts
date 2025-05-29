import { Test, TestingModule } from '@nestjs/testing';
import { RecordModule } from '../record.module';
import { RecordService } from '../record.service';
import { RecordController } from '../record.controller';
import { RecordRepository } from '../record.repository';
import { MusicbrainzService } from '../musicbrainz.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordSchema } from '../record.schema';
import { getModelToken } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { NodeCacheService } from '../../common/cache/node-cache.service';
import { CacheInterface } from '../../common/cache/cache.interface';

describe('RecordModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        RecordModule,
        MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60000,
              limit: 10,
            },
          ],
        }),
      ],
      providers: [
        {
          provide: 'CacheInterface',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            clearByPrefix: jest.fn(),
            clearAll: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(getModelToken('Record'))
      .useValue({})
      .compile();
  });

  it('should compile the module and resolve RecordService', () => {
    const service = module.get<RecordService>(RecordService);
    expect(service).toBeDefined();
  });

  it('should resolve RecordRepository', () => {
    const repo = module.get<RecordRepository>(RecordRepository);
    expect(repo).toBeDefined();
  });

  it('should resolve RecordController', () => {
    const controller = module.get<RecordController>(RecordController);
    expect(controller).toBeDefined();
  });

  it('should resolve CacheService and MusicbrainzService', () => {
    const cache = module.get<CacheInterface>(NodeCacheService);
    const music = module.get<MusicbrainzService>(MusicbrainzService);
    expect(cache).toBeDefined();
    expect(music).toBeDefined();
  });
});
