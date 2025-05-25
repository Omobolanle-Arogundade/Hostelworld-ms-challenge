import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../order.schema';

describe('OrderController', () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  beforeEach(async () => {
    service = {
      createOrder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('create', () => {
    it('should call orderService.createOrder with correct dto', async () => {
      const dto: CreateOrderDto = {
        recordId: '60d5ec49f1b2c8a3f8e4b0a1',
        quantity: 2,
      };

      const mockOrder = { id: 'order123', ...dto } as Order;
      service.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.create(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockOrder);
    });
  });
});
