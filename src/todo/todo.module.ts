import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { TODO_COLLECTION_NAME } from './schemas/constants';
import { TodoSchema } from './schemas/todo.schema';
import { UserSchema } from '../users/schemas/users.schema';
import { UserSettingSchema } from '../users/schemas/users-settings.schema';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'user-jwt' }),
    MongooseModule.forFeature([
      { name: USER_COLLECTION_NAME, schema: UserSchema },
      { name: USER_SETTING_COLLECTION_NAME, schema: UserSettingSchema },
      { name: TODO_COLLECTION_NAME, schema: TodoSchema },
    ]),
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
