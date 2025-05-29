import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './order.schema';
import { OrderController } from './order.controller';

import { RecordModule } from '../record/record.module';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { CacheModule } from '../common/cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    RecordModule,
    CacheModule,
  ],
  providers: [
    OrderService,
    OrderRepository,
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
  controllers: [OrderController],
})
export class OrderModule {}
