import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { RecordRepository } from '../../record/record.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Record } from '../../record/record.schema';
import { Order } from '../order.schema';
import { Types } from 'mongoose';
import { CreateOrderPayloadDto } from '../dtos/create-order-payload.dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<OrderRepository>;
  let recordRepo: jest.Mocked<RecordRepository>;

  beforeEach(async () => {
    orderRepo = {
      withTransaction: jest.fn().mockImplementation((fn) => fn('mockSession')), // Mock transaction handling
      create: jest.fn(),
    } as any;

    recordRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: orderRepo },
        { provide: RecordRepository, useValue: recordRepo },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('createOrder', () => {
    const payload: CreateOrderPayloadDto = {
      recordId: new Types.ObjectId('68356edf297ec83393d3eb97'),
      quantity: 2,
      userId: '68356edf297ec83393d3eb98',
    };

    it('should throw NotFoundException if record does not exist', async () => {
      recordRepo.findById.mockResolvedValue(null);

      await expect(service.createOrder(payload)).rejects.toThrow(
        NotFoundException,
      );
      expect(orderRepo.withTransaction).toHaveBeenCalled();
      expect(orderRepo.withTransaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw BadRequestException if quantity exceeds stock', async () => {
      recordRepo.findById.mockResolvedValue({
        qty: 1,
        album: 'Test Album',
      } as Record);

      await expect(service.createOrder(payload)).rejects.toThrow(
        BadRequestException,
      );
      expect(orderRepo.withTransaction).toHaveBeenCalled();
      expect(orderRepo.withTransaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should create order and update record inside a transaction', async () => {
      const mockRecord = { qty: 5, album: 'Test Album' } as Record;
      const mockOrder = { id: 'order123', ...payload } as unknown as Order;

      recordRepo.findById.mockResolvedValue(mockRecord);
      orderRepo.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder(payload);

      expect(recordRepo.update).toHaveBeenCalledWith(
        payload.recordId,
        { qty: 3 },
        'mockSession',
      );
      expect(orderRepo.create).toHaveBeenCalledWith(
        {
          recordId: new Types.ObjectId(payload.recordId),
          quantity: payload.quantity,
          userId: new Types.ObjectId(payload.userId),
        },
        'mockSession',
      );
      expect(result).toBe(mockOrder);
      expect(orderRepo.withTransaction).toHaveBeenCalled();
      expect(orderRepo.withTransaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const unexpectedError = new Error('Unexpected failure');
      recordRepo.findById.mockRejectedValueOnce(unexpectedError);

      await expect(service.createOrder(payload)).rejects.toThrow(
        unexpectedError,
      );
      expect(orderRepo.withTransaction).toHaveBeenCalled();
      expect(orderRepo.withTransaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });
});
