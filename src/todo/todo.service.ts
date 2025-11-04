import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { Model } from 'mongoose';
import { TODO_COLLECTION_NAME } from './schemas/constants';
import * as moment from 'moment';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(USER_COLLECTION_NAME) private readonly userModel: Model<any>,
    @InjectModel(USER_SETTING_COLLECTION_NAME) private readonly userSettingModel: Model<any>,
    @InjectModel(TODO_COLLECTION_NAME) private readonly todoModel: Model<any>,
  ) {}
  async create(userId: string, body: any) {
    try {
      const newTodo = new this.todoModel({
        ...body,
        data: moment(body.date).utc().add(7, 'hours'),
        formatDate: moment(body.date).utc().add(7, 'hours').format('YYYY-MM-DD'),
        userId: userId,
        user: userId,
      });
      await newTodo.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getTodo(userId: string) {
    try {
      const listTodo = await this.todoModel.find({ userId }).exec();
      return listTodo;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTodo(userId: string, id: string) {
    try {
      await this.todoModel.findByIdAndDelete(id).exec();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateTodo(userId: string, body: any) {
    try {
      const todo = await this.todoModel.findById(body.id);
      console.log('moment', moment());

      if (!todo) {
        throw new HttpException(`Không tìm thấy thông tin todo.`, 404);
      }
      todo.set({
        ...(body?.title !== undefined && { title: body.title }),
        ...(body?.description !== undefined && { description: body.description }),
        ...(body?.date !== undefined && {
          date: moment(body.date).utc().add(7, 'hours'),
          formatDate: moment(body.date).utc().add(7, 'hours').format('YYYY-MM-DD'),
        }),
        ...(body?.done !== undefined && { done: body.done }),
        ...(body?.done === true && { doneDate: moment().toDate() }),
        ...(body?.priority !== undefined && { priority: body.priority }),
      });

      await todo.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
