import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from './schemas/constants';
import { UserSchema } from './schemas/users.schema';
import { UserSettingSchema } from './schemas/users-settings.schema';
import { UserJwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: USER_COLLECTION_NAME, schema: UserSchema },
      { name: USER_SETTING_COLLECTION_NAME, schema: UserSettingSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserJwtStrategy],
})
export class UsersModule {}
