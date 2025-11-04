import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { TRADES_COLLECTION_NAME } from './schemas/constants';
import { TradesSchema } from './schemas/trades.schema';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { UserSchema } from '../users/schemas/users.schema';
import { UserSettingSchema } from '../users/schemas/users-settings.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: TRADES_COLLECTION_NAME, schema: TradesSchema },
      { name: USER_COLLECTION_NAME, schema: UserSchema },
      { name: USER_SETTING_COLLECTION_NAME, schema: UserSettingSchema },
    ]),
  ],
  controllers: [TradingController],
  providers: [TradingService],
})
export class TradingModule {}
