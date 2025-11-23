import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PokerService } from './poker.service';
import { CreatePokerDto } from './dto/create-poker.dto';
import { UpdatePokerDto } from './dto/update-poker.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('poker')
export class PokerController {
  constructor(private readonly pokerService: PokerService) {}

  @Post('add-session')
  @UseGuards(AuthGuard('user-jwt'))
  create(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.pokerService.addSession(userId, body);
  }

  @Post('session/update')
  @UseGuards(AuthGuard('user-jwt'))
  updateSession(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.pokerService.updateSession(userId, body);
  }

  @Post('list')
  @UseGuards(AuthGuard('user-jwt'))
  listSession(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.pokerService.listSession(userId, body);
  }

  @Post('group')
  @UseGuards(AuthGuard('user-jwt'))
  listGroupSessionlistGroupTrade(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.pokerService.listGroupSession(userId, body);
  }

  // @Get(':id')
  // @UseGuards(AuthGuard('user-jwt'))
  // getTradeDetail(@Param('id') id: string) {
  //   return this.pokerService.getTradeDetail(id);
  // }

  @Delete(':id')
  @UseGuards(AuthGuard('user-jwt'))
  deleteTrade(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.pokerService.deleteSession(userId, id);
  }
}
