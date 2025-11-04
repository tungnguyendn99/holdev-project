import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @UseGuards(AuthGuard('user-jwt'))
  create(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.todoService.create(userId, body);
  }

  @Get()
  @UseGuards(AuthGuard('user-jwt'))
  getTodo(@Req() req) {
    const userId = req.user.userId;
    return this.todoService.getTodo(userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('user-jwt'))
  deleteTodo(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.todoService.deleteTodo(userId, id);
  }

  @Post('update')
  @UseGuards(AuthGuard('user-jwt'))
  updateTodo(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.todoService.updateTodo(userId, body);
  }
}
