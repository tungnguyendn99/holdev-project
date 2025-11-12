/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ENGLISH_WORDS_COLLECTION_NAME, QUOTES_COLLECTION_NAME } from '../english/schemas/constants';
import { QuotesSchema } from '../english/schemas/quotes.schema';
import { EnglishModule } from '../english/english.module';
import { MongoConfigModule } from '../config/config.module';
import { EnglishWordsSchema } from '../english/schemas/english-words.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: QUOTES_COLLECTION_NAME, schema: QuotesSchema },
      { name: ENGLISH_WORDS_COLLECTION_NAME, schema: EnglishWordsSchema },
    ]),
    EnglishModule,
    MongoConfigModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
