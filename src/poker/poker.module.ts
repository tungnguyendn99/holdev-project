import { Module } from '@nestjs/common';
import { PokerService } from './poker.service';
import { PokerController } from './poker.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { POKER_SESSION_COLLECTION_NAME } from './schemas/constants';
import { PokerSessionSchema } from './schemas/poker-session.schema';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { UserSchema } from '../users/schemas/users.schema';
import { UserSettingSchema } from '../users/schemas/users-settings.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: POKER_SESSION_COLLECTION_NAME, schema: PokerSessionSchema },
      { name: USER_COLLECTION_NAME, schema: UserSchema },
      { name: USER_SETTING_COLLECTION_NAME, schema: UserSettingSchema },
    ]),
  ],
  controllers: [PokerController],
  providers: [PokerService],
})
export class PokerModule {}
