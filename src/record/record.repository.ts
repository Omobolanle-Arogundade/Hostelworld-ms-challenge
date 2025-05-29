import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Record } from './record.schema';
import { FilterRecordsQueryDto } from './dtos/filter-records.query.dto';

@Injectable()
export class RecordRepository {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
  ) {}

  /**
   *
   * @param query Filter records query
   * @returns Array of records and total count
   * @description This method retrieves all records based on the provided query parameters.
   * It also supports pagination through the page and limit parameters.
   */
  async findAll(query: FilterRecordsQueryDto): Promise<[Record[], number]> {
    const { artist, album, category, format, q, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter: { [key: string]: any } = {};

    if (q) {
      filter.$or = [
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (artist) filter.artist = new RegExp(artist, 'i');
    if (album) filter.album = new RegExp(album, 'i');
    if (category) filter.category = category;
    if (format) filter.format = format;

    const [data, total] = await Promise.all([
      this.recordModel.find(filter).skip(skip).limit(limit).lean().exec(),
      this.recordModel.countDocuments(filter),
    ]);

    return [data, total];
  }

  /**
   * @param payload Record payload
   * @description This method creates a new record in the database.
   * @returns The created record
   */
  async create(payload: Partial<Record>): Promise<Record> {
    return this.recordModel.create(payload);
  }

  /**
   * @param id id of the record to update
   * @param data Data to update
   * @param session Mongoose client session for transaction support
   * @description This method updates an existing record in the database.
   */
  async update(
    id: Types.ObjectId,
    data: Partial<Record>,
    session?: ClientSession,
  ) {
    return this.recordModel
      .updateOne({ _id: id }, data, { session })
      .lean()
      .exec();
  }

  /**
   *
   * @param id id of the record to find
   * @description This method retrieves a record by its ID from the database.
   * @returns The record if found, otherwise null
   */
  async findById(id: Types.ObjectId): Promise<Record | null> {
    return this.recordModel.findById(id).lean().exec();
  }

  /**
   * @param id id of the record to delete
   * @description This method deletes a record by its ID from the database.
   */
  async delete(id: Types.ObjectId): Promise<Record | null> {
    return this.recordModel.findByIdAndDelete(id).lean().exec();
  }
}
