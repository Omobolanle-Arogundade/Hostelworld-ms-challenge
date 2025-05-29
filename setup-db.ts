import * as mongoose from 'mongoose';
import * as readline from 'readline';
import { AppConfig } from './src/app.config';
import { Record, RecordSchema } from './src/record/record.schema';
import { User, UserSchema } from './src/user/user.schema';
import { Order, OrderSchema } from './src/order/order.schema';
import { Role } from './src/user/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { data } from './data';

async function setupDatabase() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Do you want to clean up the existing collections? (Y/N): ',
      async (answer) => {
        rl.close();

        await mongoose.connect(AppConfig.mongoUrl);

        const recordModel: mongoose.Model<Record> = mongoose.model(
          'Record',
          RecordSchema,
        );
        const userModel: mongoose.Model<User> = mongoose.model(
          'User',
          UserSchema,
        );

        const orderModel: mongoose.Model<Order> = mongoose.model(
          'Order',
          OrderSchema,
        );

        if (answer.toLowerCase() === 'y') {
          await recordModel.deleteMany({});
          await userModel.deleteMany({});
          await orderModel.deleteMany({});
          console.log('Records, orders and users collections cleaned up.');
        }

        const userData = (data?.users || []).map((user: any) => ({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }));

        console.log(
          `Inserting ${userData.length} users with hashed passwords...`,
        );

        await userModel.insertMany(userData);

        console.log('Seeded admin and regular users.');

        const admin = await userModel.findOne({ role: Role.ADMIN });

        const user = await userModel.findOne({ role: Role.USER });

        if (!admin) {
          console.error('No admin user found in the seeded data.');
          mongoose.disconnect();
          return;
        }
        console.log(`Admin user found: ${admin.email}`);

        const recordsData = (data?.records || []).map((record: any) => ({
          ...record,
          createdBy: admin._id, // Assigning the admin user as the owner of the orders
        }));

        await recordModel.insertMany(recordsData);
        console.log(`Inserted ${recordsData.length} records successfully!`);

        if (!user) {
          console.error('No regular user found in the seeded data.');
          mongoose.disconnect();
          return;
        }

        const records = (await recordModel.find().limit(3).lean()) || [];

        await orderModel.insertMany(
          records.map((record) => {
            return {
              recordId: record._id,
              userId: user._id,
              quantity: 1,
            };
          }),
        );

        mongoose.disconnect();
      },
    );
  } catch (error) {
    console.error('Error setting up the database:', error);
    mongoose.disconnect();
  }
}

setupDatabase();
