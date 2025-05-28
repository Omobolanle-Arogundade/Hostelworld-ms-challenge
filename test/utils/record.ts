import mongoose, { Types } from 'mongoose';
import { Record, RecordSchema } from '../../src/record/record.schema';

export const getRecordId = async (): Promise<Types.ObjectId> => {
  const RecordModel = mongoose.model<Record>('Record', RecordSchema);

  const record = (await RecordModel.findOne({})) as Record;

  return record._id as Types.ObjectId;
};
