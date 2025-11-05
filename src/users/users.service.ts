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

  async updateUser(body: any): Promise<any> {
    try {
      const updateUser = await this.userModel
        .findByIdAndUpdate(
          { _id: body.id },
          {
            features: body.features,
          },
        )
        .exec();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
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
}
