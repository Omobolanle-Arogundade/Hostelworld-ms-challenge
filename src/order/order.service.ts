import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './order.schema';
import { RecordRepository } from '../record/record.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly recordRepo: RecordRepository,
  ) {}

  async createOrder(payload: CreateOrderDto): Promise<Order> {
    const transactionFn = async (session) => {
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
      return this.orderRepo.create(
        {
          recordId: payload.recordId,
          quantity: payload.quantity,
        },
        session,
      );
    };

    return this.orderRepo.withTransaction(transactionFn);
  }
}
