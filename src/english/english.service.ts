import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEnglishDto } from './dto/create-english.dto';
import { UpdateEnglishDto } from './dto/update-english.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ENGLISH_WORDS_COLLECTION_NAME, QUOTES_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigMongoService } from '../config/config.mongo.service';

@Injectable()
export class EnglishService {
  constructor(
    @InjectModel(ENGLISH_WORDS_COLLECTION_NAME) private readonly englishWordModel: Model<any>,
    @InjectModel(QUOTES_COLLECTION_NAME) private readonly quoteModel: Model<any>,
    private readonly httpService: HttpService,
    private readonly urlConfigService: ConfigMongoService,
  ) {}

  async proxyGetQuotesEveryday() {
    const quotesApiUrl = this.urlConfigService.getQuotesUrlApi();
    const options = {
      method: 'GET',
      url: quotesApiUrl,
      headers: {
        'x-rapidapi-host': 'quotes-api12.p.rapidapi.com',
        'x-rapidapi-key': this.urlConfigService.getRapidApiKey(),
      },
    };

    try {
      const response = await this.httpService.axiosRef.request(options);
      const quotesData = response.data;
      console.log('quotesData', quotesData);

      const newQuote = new this.quoteModel({
        quote: quotesData.quote,
        author: quotesData.author,
        type: quotesData.type,
      });
      await newQuote.save();

      return quotesData;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  }

  async getQuoteHomePage() {
    return this.quoteModel
      .findOne()
      .sort({ createdAt: -1 }) // Áp dụng sort trước khi findOne()
      .exec();
  }

  async proxyGetEnglishWord(word: string) {
    const wordsApiUrl = this.urlConfigService.getEnglishWordsUrlApi();
    const options = {
      method: 'GET',
      url: `${wordsApiUrl}/words/${word}`,
      headers: {
        'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
        'x-rapidapi-key': this.urlConfigService.getRapidApiKey(),
      },
    };

    try {
      const response = await this.httpService.axiosRef.request(options);

      const newWord = new this.englishWordModel({
        ...response.data,
      });
      await newWord.save();
      return newWord;
    } catch (error) {
      console.error('Error fetching word definition:', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addNewWord(word: string) {
    try {
      const existWord = await this.getWordDefinition(word);
      if (existWord) {
        return existWord;
      }
      const newWord = await this.proxyGetEnglishWord(word);
      return newWord;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getWordDefinition(word: string) {
    return await this.englishWordModel.findOne({ word }).exec();
  }
}
