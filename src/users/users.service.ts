import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from './schemas/constants';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_COLLECTION_NAME) private readonly userModel: Model<any>,
    @InjectModel(USER_SETTING_COLLECTION_NAME) private readonly userSettingModel: Model<any>,
  ) {}
  async createUser(body: any): Promise<any> {
    try {
      const newUser = new this.userModel({
        username: body.username,
        password: body.password,
      });
      await newUser.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(userId: string, body: any) {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new HttpException('Session not found.', HttpStatus.NOT_FOUND);
      }

      const updates: Record<string, any> = {};

      // 🧩 Cập nhật các field cơ bản
      const allowedFields = ['username', 'avatar'];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      // ✅ Gán tất cả updates 1 lần
      user.set(updates);
      await user.save();

      return await user.save();
    } catch (error) {
      console.error('updateTrade error:', error);
      throw new HttpException(error?.message || 'Failed to update session', HttpStatus.BAD_REQUEST);
    }
  }

  async login(body: any): Promise<any> {
    try {
      console.log('body', body);

      const user = await this.userModel.findOne({ username: body.username, password: body.password });
      console.log('user', user);

      const accessToken = sign({ userId: user._id, username: user.username }, 'secretToken123');
      return { accessToken, user };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createUserSetting(userId: string, body: any): Promise<any> {
    try {
      const newUserSetting = new this.userSettingModel({
        ...body,
        dayTarget: body.monthTarget ? body.monthTarget / 22 : undefined,
        userId: userId,
        user: userId,
      });
      await newUserSetting.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserSetting(userId: string, body: any): Promise<any> {
    try {
      const userSetting = await this.userSettingModel.findOne({ userId: userId, type: body.type }).exec();
      if (!userSetting) {
        throw new Error('User setting not found');
      }
      return userSetting;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUserSetting(userId: string, body: any): Promise<any> {
    try {
      const updateUserSetting = await this.userSettingModel
        .findOneAndUpdate(
          { _id: body.id, userId, type: body.type },
          {
            ...body,
            dayTarget: body.monthTarget ? body.monthTarget / 22 : undefined,
          },
        )
        .exec();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
