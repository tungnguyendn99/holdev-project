import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { TRADES_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { groupTrades } from './utils/trades.util';
import * as moment from 'moment';

@Injectable()
export class TradingService {
  constructor(
    @InjectModel(TRADES_COLLECTION_NAME) private readonly tradeModel: Model<any>,
    @InjectModel(USER_COLLECTION_NAME) private readonly userModel: Model<any>,
    @InjectModel(USER_SETTING_COLLECTION_NAME) private readonly userSettingModel: Model<any>,
  ) {}
  async addTrade(userId: string, body: any) {
    try {
      const newTrade = new this.tradeModel({
        ...body,
        userId: userId,
        user: userId,
      });
      await newTrade.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async listTrade(userId: string, body: any) {
    try {
      let query: any = {
        userId,
      };
      if (body.dateString) {
        const startOfMonth = moment(body.dateString, 'YYYY-MM').startOf('month').toDate();
        const endOfMonth = moment(body.dateString, 'YYYY-MM').endOf('month').toDate();
        query = { ...query, closeTime: { $gte: startOfMonth, $lte: endOfMonth } };
      }
      console.log('query', query);

      const listTrade = await this.tradeModel.find(query).sort({ closeTime: -1 }).exec();
      if (body.mode) {
        return groupTrades(listTrade, body.mode);
      }
      return listTrade;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async tradesOfDay(userId: string, body: any) {
  //   try {
  //     const query = {
  //       // closeTime:
  //     }
  //     const listTrade = await this.tradeModel.find({ userId }).exec();
  //     return listTrade;
  //   } catch (error) {
  //     console.log('error', error);
  //     throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async getTradeDetail(id: string) {
    try {
      const trade = await this.tradeModel.findById(id).exec();
      if (!trade) {
        throw new HttpException(`Không tìm thấy thông tin trade.`, 404);
      }
      return trade.toObject();
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTodo(userId: string, id: string) {
    try {
      await this.tradeModel.findByIdAndDelete(id).exec();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateTrade(userId: string, body: any) {
    try {
      const trade = await this.tradeModel.findById(body.id);

      if (!trade) {
        throw new HttpException(`Không tìm thấy thông tin todo.`, 404);
      }
      trade.set({
        ...(body?.closePrice !== undefined && { closePrice: body.closePrice }),
        ...(body?.closeTime !== undefined && { closeTime: body.closeTime }),
        ...(body?.takeProfit !== undefined && { takeProfit: body.takeProfit }),
        ...(body?.stopLoss !== undefined && { stopLoss: body.stopLoss }),
        ...(body?.closedBy !== undefined && { closedBy: body.closedBy }),
        ...(body?.result !== undefined && { result: body.result }),
        ...(body?.rating !== undefined && { rating: body.rating }),
        ...(body?.yourThought !== undefined && { yourThought: body.yourThought }),
      });

      await trade.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
