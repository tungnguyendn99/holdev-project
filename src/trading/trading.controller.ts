import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TradingService } from './trading.service';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('add-trade')
  @UseGuards(AuthGuard('user-jwt'))
  create(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.tradingService.addTrade(userId, body);
  }

  @Post('update')
  @UseGuards(AuthGuard('user-jwt'))
  updateTrade(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.tradingService.updateTrade(userId, body);
  }

  @Post('list')
  @UseGuards(AuthGuard('user-jwt'))
  listTrade(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.tradingService.listTrade(userId, body);
  }

  @Post('group')
  @UseGuards(AuthGuard('user-jwt'))
  listGroupTrade(@Req() req, @Body() body: any) {
    const userId = req.user.userId;
    return this.tradingService.listGroupTrade(userId, body);
  }

  @Get(':id')
  @UseGuards(AuthGuard('user-jwt'))
  getTradeDetail(@Param('id') id: string) {
    return this.tradingService.getTradeDetail(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('user-jwt'))
  deleteTrade(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.tradingService.deleteTrade(userId, id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTradingDto: UpdateTradingDto) {
  //   return this.tradingService.update(+id, updateTradingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tradingService.remove(+id);
  // }
}
