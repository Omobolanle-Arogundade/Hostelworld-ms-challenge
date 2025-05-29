import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Order } from './order.schema';
import { MostOrderedRecordsDto } from './dtos/most-ordered-records.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  /**
   * @param payload Order payload
   * @param session Mongoose client session for transaction support
   * @description This method creates a new order in the database.
   * @returns The created order
   */
  async create(
    payload: Partial<Order>,
    session: ClientSession,
  ): Promise<Order> {
    const [order] = await this.orderModel.create([payload], { session });
    return order;
  }

  /**
   * @param fn Function to execute within a transaction
   * @description This method executes a function within a MongoDB transaction.
   * It starts a session, begins a transaction, and commits or aborts the transaction based on the function's success or failure.
   * If the function throws an error, the transaction is aborted.
   * If the function completes successfully, the transaction is committed.
   * @returns The result of the function executed within the transaction
   */
  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * @returns An array of records that have been ordered the most
   * @description This method retrieves the records that have been ordered the most.
   * It aggregates the orders to find the total quantity ordered for each record,
   * sorts them in descending order, and returns the top records along with their artist and album information.
   */
  async getMostOrderedRecords(): Promise<MostOrderedRecordsDto[]> {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: '$recordId',
          totalOrdered: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'records',
          localField: '_id',
          foreignField: '_id',
          as: 'record',
        },
      },
      {
        $unwind: '$record',
      },
      {
        $sort: { totalOrdered: -1 },
      },
      {
        $project: {
          _id: 0,
          recordId: '$record._id',
          artist: '$record.artist',
          album: '$record.album',
          totalOrdered: 1,
        },
      },
    ]);
  }
}
