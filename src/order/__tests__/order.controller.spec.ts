import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../order.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthenticatedRequestDto } from '../../shared/dtos/authenticate-request.dto';
import { Types } from 'mongoose';

describe('OrderController', () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  beforeEach(async () => {
    service = {
      createOrder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 60,
              limit: 5,
            },
          ],
        }),
      ],
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('create', () => {
    it('should call orderService.createOrder with correct dto', async () => {
      const dto: CreateOrderDto = {
        recordId: new Types.ObjectId('60d5ec49f1b2c8a3f8e4b0a1'),
        quantity: 2,
      };

      const req = {
        user: { userId: '60d5ec49f1b2c8a3f8e4b0a2' },
      } as unknown as AuthenticatedRequestDto;

      const mockOrder = { id: 'order123', ...dto } as unknown as Order;
      service.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.create(dto, req);

      expect(service.createOrder).toHaveBeenCalledWith({
        ...dto,
        userId: req.user.userId,
      });
      expect(result).toBe(mockOrder);
    });
  });
});
