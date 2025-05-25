import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './order.schema';
import { RecordRepository } from '../record/record.repository';

@Injectable()
export class OrderService {
  private readonly logger: Logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly recordRepo: RecordRepository,
  ) {}

  async createOrder(payload: CreateOrderDto): Promise<Order> {
    const ctx = `OrderService.createOrder: ${JSON.stringify(payload)}`;
    const transactionFn = async (session) => {
      this.logger.debug(`Starting transaction for order creation`, ctx);
      const record = await this.recordRepo.findById(payload.recordId); // Check if record exists

      if (!record) {
        throw new NotFoundException(
          `Record with ID ${payload.recordId} not found!!`,
        );
      }

      if (record.qty < payload.quantity) {
        // Check if sufficient stock is available
        throw new BadRequestException(
          `Insufficient stock for record '${record.album}'. Available: ${record.qty}, Requested: ${payload.quantity}`,
        );
      }

      // Decrement stock inside session
      await this.recordRepo.update(
        payload.recordId,
        {
          qty: record.qty - payload.quantity,
        },
        session,
      );

      // Create order inside session
      const order = this.orderRepo.create(
        {
          recordId: payload.recordId,
          quantity: payload.quantity,
        },
        session,
      );

      this.logger.log(
        `Order created successfully for record '${record.album}' with quantity ${payload.quantity}`,
        ctx,
      );

      return order;
    };

    const order = await this.orderRepo.withTransaction(transactionFn);
    return order;
  }
}
