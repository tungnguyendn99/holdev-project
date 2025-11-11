import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Post('update')
  async updateUser(@Body() body: any) {
    return this.usersService.updateUser(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.usersService.login(body);
  }

  @Post('setting')
  @UseGuards(AuthGuard('user-jwt'))
  async createUserSetting(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.usersService.createUserSetting(userId, body);
  }

  @Post('get-setting')
  @UseGuards(AuthGuard('user-jwt'))
  async getUserSetting(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.usersService.getUserSetting(userId, body);
  }

  @Post('update-setting')
  @UseGuards(AuthGuard('user-jwt'))
  async updateUserSetting(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.usersService.updateUserSetting(userId, body);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
