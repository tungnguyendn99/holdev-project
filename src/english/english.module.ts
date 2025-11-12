import { Module } from '@nestjs/common';
import { EnglishService } from './english.service';
import { EnglishController } from './english.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ENGLISH_WORDS_COLLECTION_NAME, QUOTES_COLLECTION_NAME } from './schemas/constants';
import { EnglishWordsSchema } from './schemas/english-words.schema';
import { QuotesSchema } from './schemas/quotes.schema';
import { MongoConfigModule } from '../config/config.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: ENGLISH_WORDS_COLLECTION_NAME, schema: EnglishWordsSchema },
      { name: QUOTES_COLLECTION_NAME, schema: QuotesSchema },
    ]),
    MongoConfigModule,
  ],
  controllers: [EnglishController],
  providers: [EnglishService],
  exports: [EnglishService],
})
export class EnglishModule {}
