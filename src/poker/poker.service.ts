import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePokerDto } from './dto/create-poker.dto';
import { UpdatePokerDto } from './dto/update-poker.dto';
import { InjectModel } from '@nestjs/mongoose';
import { POKER_SESSION_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import * as moment from 'moment';
import { calculatePokerInfo, getDateRangeByMode, groupSessions } from './utils/poker.util';

@Injectable()
export class PokerService {
  constructor(
    @InjectModel(POKER_SESSION_COLLECTION_NAME) private readonly pokerSessionModel: Model<any>,
    @InjectModel(USER_COLLECTION_NAME) private readonly userModel: Model<any>,
    @InjectModel(USER_SETTING_COLLECTION_NAME) private readonly userSettingModel: Model<any>,
  ) {}

  async addSession(userId: string, body: any) {
    try {
      const sessionData = {
        ...body,
        ...(body?.totalAfter && body?.result
          ? calculatePokerInfo(body.blind, body.totalBefore, body.totalAfter, body.result)
          : {}),
        ...(body.startTime && body.endTime
          ? (() => {
              const diff = moment.duration(moment(body.endTime).diff(moment(body.startTime)));
              const duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
              return { duration };
            })()
          : {}),
        userId,
        user: userId,
      };

      const newSession = new this.pokerSessionModel(sessionData);
      await newSession.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async listSession(userId: string, body: any) {
    try {
      const { startDate, endDate } = getDateRangeByMode(body.mode, body.dateString);

      const query = {
        userId,
        isDeleted: { $ne: true },
        startTime: { $gte: startDate, $lte: endDate },
      };
      console.log('query', query);

      const listTrade = await this.pokerSessionModel.find(query).sort({ startTime: -1 }).exec();

      return listTrade;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async listGroupSession(userId: string, body: any) {
    try {
      const listTrade = await this.listSession(userId, body);
      console.log('listTrade', listTrade);

      return groupSessions(listTrade, body.group);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteSession(userId: string, id: string) {
    try {
      const session = await this.pokerSessionModel.findById(id);
      session.set({ isDeleted: true });
      await session.save();

      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateSession(userId: string, body: any) {
    try {
      const session = await this.pokerSessionModel.findById(body.id);

      if (!session) {
        throw new HttpException('Session not found.', HttpStatus.NOT_FOUND);
      }

      const updates: Record<string, any> = {};

      // 🧮 Tính toán các giá trị poker (hands, resultBB, winrate)
      if (body?.totalAfter && body?.result) {
        Object.assign(updates, calculatePokerInfo(body.blind, body.totalBefore, body.totalAfter, body.result));
      }

      // ⏱️ Tính duration
      if (body.startTime && body.endTime) {
        const diff = moment.duration(moment(body.endTime).diff(moment(body.startTime)));
        const duration = `${Math.floor(diff.asHours())}h ${diff.minutes()}m`;
        updates.duration = duration;
      }

      // 🧩 Cập nhật các field cơ bản
      const allowedFields = [
        'blind',
        'format',
        'startTime',
        'endTime',
        'totalBefore',
        'totalAfter',
        'result',
        'rating',
        'yourThought',
        'images'
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      // ✅ Gán tất cả updates 1 lần
      session.set(updates);
      await session.save();

      return { success: true };
    } catch (error) {
      console.error('updateTrade error:', error);
      throw new HttpException(error?.message || 'Failed to update session', HttpStatus.BAD_REQUEST);
    }
  }
}
