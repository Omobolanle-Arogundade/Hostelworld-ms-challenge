import { Test, TestingModule } from '@nestjs/testing';
import { OrderModule } from '../order.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Order } from '../order.schema';
import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { OrderController } from '../order.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '../../common/cache/cache.module';

describe('OrderModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        OrderModule,
        MongooseModule.forFeature([{ name: 'Order', schema: Order }]),
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60000,
              limit: 10,
            },
          ],
        }),
        CacheModule,
      ],
    })
      .overrideProvider(getModelToken('Order'))
      .useValue({})
      .overrideProvider(getModelToken('Record'))
      .useValue({})
      .compile();
  });

  it('should compile the module and resolve OrderService', () => {
    const service = module.get<OrderService>(OrderService);
    expect(service).toBeDefined();
  });

  it('should resolve OrderRepository', () => {
    const repo = module.get<OrderRepository>(OrderRepository);
    expect(repo).toBeDefined();
  });

  it('should resolve OrderController', () => {
    const controller = module.get<OrderController>(OrderController);
    expect(controller).toBeDefined();
  });
});
