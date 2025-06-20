import { OrderRepository } from '../order.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../order.schema';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let model: jest.Mocked<Model<Order>>;
  let mockSession: any;

  beforeEach(async () => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    model = {
      create: jest.fn(),
      db: {
        startSession: jest.fn().mockResolvedValue(mockSession),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        { provide: getModelToken('Order'), useValue: model },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
  });

  describe('create', () => {
    it('should create an order within a session', async () => {
      const payload = {
        recordId: '123',
        quantity: 1,
        userId: 'ss',
      } as unknown as Order;
      const createdOrder = { id: 'order1', ...payload } as Order;

      model.create.mockResolvedValue([createdOrder] as any);

      const result = await repository.create(payload, mockSession);

      expect(model.create).toHaveBeenCalledWith([payload], {
        session: mockSession,
      });
      expect(result).toBe(createdOrder);
    });
  });

  describe('withTransaction', () => {
    it('should commit the transaction and return result on success', async () => {
      const fn = jest.fn().mockResolvedValue('result');

      const result = await repository.withTransaction(fn);

      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(fn).toHaveBeenCalledWith(mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should abort the transaction and throw on error', async () => {
      const error = new Error('transaction failed');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(repository.withTransaction(fn)).rejects.toThrow(error);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('getMostOrderedRecords', () => {
    it('should return most ordered records', async () => {
      const mockRecords = [
        {
          _id: 'record1',
          totalOrdered: 10,
          record: { album: 'Album1', artist: 'Artist1' },
        },
        {
          _id: 'record2',
          totalOrdered: 5,
          record: { album: 'Album2', artist: 'Artist2' },
        },
      ];

      model.aggregate = jest.fn().mockResolvedValue(mockRecords);

      const result = await repository.getMostOrderedRecords();

      expect(model.aggregate).toHaveBeenCalledWith([
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
      expect(result).toEqual(mockRecords);
    });

    it('should return an empty array if no records found', async () => {
      model.aggregate = jest.fn().mockResolvedValue([]);

      const result = await repository.getMostOrderedRecords();

      expect(model.aggregate).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
