import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { TRADES_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';

@Injectable()
export class TradingService {
  constructor(
    @InjectModel(TRADES_COLLECTION_NAME) private readonly tradeModel: Model<any>,
    @InjectModel(USER_COLLECTION_NAME) private readonly userModel: Model<any>,
    @InjectModel(USER_SETTING_COLLECTION_NAME) private readonly userSettingModel: Model<any>,
  ) {}
  async addTrade(body: any) {
    try {
      const newTrade = new this.tradeModel({
        ...body,
        userId: '6904d2843af7169e1b02285b',
        user: '6904d2843af7169e1b02285b',
      });
      await newTrade.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
