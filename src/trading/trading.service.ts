import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { TRADES_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { getDateRangeByMode, groupTrades } from './utils/trades.util';
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
        reward: body.result / 4,
        ...(body.entryTime && body.closeTime
          ? (() => {
              const diff = moment.duration(moment(body.closeTime).diff(moment(body.entryTime)));
              const duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
              return { duration };
            })()
          : {}),
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
      const { startDate, endDate } = getDateRangeByMode(body.mode, body.dateString);

      const query = {
        userId,
        isDeleted: { $ne: true },
        closeTime: { $gte: startDate, $lte: endDate },
      };
      console.log('query', query);

      const listTrade = await this.tradeModel.find(query).sort({ closeTime: -1 }).exec();
      // if (body.mode) {
      //   return groupTrades(listTrade, body.mode);
      // }
      return listTrade;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async listGroupTrade(userId: string, body: any) {
    try {
      const listTrade = await this.listTrade(userId, body);
      return groupTrades(listTrade, body.group);
      // if (body.mode) {
      // }
      // return listTrade;
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

  async deleteTrade(userId: string, id: string) {
    try {
      const trade = await this.tradeModel.findById(id);
      trade.set({ isDeleted: true });
      await trade.save();

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
        throw new HttpException(`Không tìm thấy thông tin trade.`, 404);
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
        ...(body.entryTime && body.closeTime
          ? (() => {
              const diff = moment.duration(moment(body.closeTime).diff(moment(body.entryTime)));
              const duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
              return { duration };
            })()
          : {}),
      });

      await trade.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
