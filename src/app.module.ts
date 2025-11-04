import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ConfigMongoService } from './config/config.mongo.service';
import { UtilService } from './config/util.service';
import { MongoConfigModule } from './config/config.module';
import { TradingModule } from './trading/trading.module';
import { UsersModule } from './users/users.module';
import { TodoModule } from './todo/todo.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    HttpModule,
    MongoConfigModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['config/production.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [MongoConfigModule, ConfigModule, HttpModule],
      inject: [ConfigMongoService, UtilService],
      useFactory: async (configMongoService: ConfigMongoService) => {
        return configMongoService.createMongooseOptions();
      },
    }),
    TradingModule,
    UsersModule,
    TodoModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
