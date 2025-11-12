import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TradingService } from './trading.service';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('upload-excel')
  @UseGuards(AuthGuard('user-jwt'))
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên trường (field name) của file trong form data
  async uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file || file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      throw new HttpException('Vui lòng upload file Excel (.xlsx) hợp lệ.', HttpStatus.BAD_REQUEST);
    }
    const userId = req.user.userId;
    try {
      // throw new HttpException('Lỗi khi xử lý file Excel.', HttpStatus.INTERNAL_SERVER_ERROR);
      // return {
      //   message: `Upload trades successfully!`,
      //   dataCount: 10,
      // };
      const result = await this.tradingService.processExcelFile(userId, file.buffer);

      return {
        message: `Upload ${result.length} trades successfully!`,
        dataCount: result.length,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException('Lỗi khi xử lý file Excel.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
