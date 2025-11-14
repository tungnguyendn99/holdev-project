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

  async proxyTranslateWord(word: string) {
    const wordsApiUrl = this.urlConfigService.getTranslateWordsUrlApi();
    const options = {
      method: 'GET',
      url: `${wordsApiUrl}?input_text=${word}&to_language=vi`,
      headers: {
        'x-rapidapi-host': 'google-translate-api14.p.rapidapi.com',
        'x-rapidapi-key': this.urlConfigService.getRapidApiKey(),
      },
    };
    try {
      const { data } = await this.httpService.axiosRef.request(options);
      return data.translated_text || '';
    } catch (error) {
      console.error('Error proxyTranslateWord:', error);
      return '';
    }
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
      const translate = await this.proxyTranslateWord(word);

      const newWord = new this.englishWordModel({
        ...response.data,
        translate,
      });
      await newWord.save();
      return newWord;
    } catch (error) {
      console.error('Error fetching word definition:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error?.response?.data?.message, HttpStatus.BAD_REQUEST);
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getWordDefinition(word: string) {
    return await this.englishWordModel.findOne({ word }).exec();
  }

  async getListWords() {
    return await this.englishWordModel.find().sort({ createdAt: -1 }).exec();
  }
}
