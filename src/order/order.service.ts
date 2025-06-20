import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from './order.schema';
import { RecordRepository } from '../record/record.repository';
import { Types } from 'mongoose';
import { CreateOrderPayloadDto } from './dtos/create-order-payload.dto';
import { CacheInterface } from '../common/cache/cache.interface';
import { MostOrderedRecordsDto } from './dtos/most-ordered-records.dto';

@Injectable()
export class OrderService {
  private readonly logger: Logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly recordRepo: RecordRepository,
    @Inject('CacheInterface') private readonly cacheService: CacheInterface,
  ) {}

  async createOrder(payload: CreateOrderPayloadDto): Promise<Order> {
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
          recordId: new Types.ObjectId(payload.recordId),
          quantity: payload.quantity,
          userId: new Types.ObjectId(payload.userId),
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
    await this.cacheService.clearByPrefix('records::');
    await this.cacheService.clearByPrefix('mostOrderedRecords');
    return order;
  }

  async fetchMostOrderedRecords(): Promise<MostOrderedRecordsDto[]> {
    const cacheKey = 'mostOrderedRecords';
    const cachedResult =
      await this.cacheService.get<MostOrderedRecordsDto[]>(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Returning cached most ordered records`);
      return cachedResult;
    }

    const result = await this.orderRepo.getMostOrderedRecords();

    this.logger.debug(`Fetched most ordered records successfully`);
    await this.cacheService.set(cacheKey, result);
    return result;
  }
}
