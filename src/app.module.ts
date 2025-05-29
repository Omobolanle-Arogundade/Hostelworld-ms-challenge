import { Module } from '@nestjs/common';
import { RecordModule } from './record/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { OrderModule } from './order/order.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MetricsController } from './common/metrics/metrics.controller';
import { MetricsService } from './common/metrics/metrics.service';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'admin_ui'),
      exclude: ['/api*', '/swagger*', '/metrics*'],
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    MongooseModule.forRoot(AppConfig.mongoUrl),
    RecordModule,
    OrderModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    AuthModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class AppModule {}
