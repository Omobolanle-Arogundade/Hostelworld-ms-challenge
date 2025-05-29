import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RecordSchema, Record } from '../../src/record/record.schema';
import { User, UserSchema } from '../../src/user/user.schema';
import { data } from '../../data';
import { Order, OrderSchema } from '../../src/order/order.schema';

export const seedDatabase = async () => {
  const UserModel = mongoose.model<User>('User', UserSchema);
  const RecordModel = mongoose.model<Record>('Record', RecordSchema);
  const OrderModel = mongoose.model<Order>('Order', OrderSchema);

  await UserModel.deleteMany({});
  await RecordModel.deleteMany({});

  const hashPassword = async (password) => await bcrypt.hash(password, 10);

  const [adminData, userData] = data.users;

  const users = [
    { ...adminData, password: await hashPassword(adminData.password) },
    { ...userData, password: await hashPassword(userData.password) },
  ];

  const [admin, user] = await UserModel.insertMany(users);

  await RecordModel.insertMany(
    data.records.map((record) => ({
      ...record,
      createdBy: admin._id,
    })),
  );

  const records = await RecordModel.find().limit(3).lean();

  await OrderModel.insertMany(
    records.map((record) => {
      return {
        recordId: record._id,
        userId: user._id,
        quantity: 1,
      };
    }),
  );

  return { admin, user };
};
