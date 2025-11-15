import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTradingDto } from './dto/create-trading.dto';
import { UpdateTradingDto } from './dto/update-trading.dto';
import { TRADES_COLLECTION_NAME } from './schemas/constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../users/schemas/constants';
import { getDateRangeByMode, groupTrades, normalizeNumberString } from './utils/trades.util';
import * as moment from 'moment';
import * as XLSX from 'xlsx';

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
      const result = listTrade.map((t) => {
        const item = t.toObject();
        return {
          ...item,
          lots: Number(t.lots.toFixed(4)),
          id: item._id,
        };
      });
      // if (body.mode) {
      //   return groupTrades(listTrade, body.mode);
      // }
      return result;
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
        ...(body?.images !== undefined && { images: body.images }),
      });

      await trade.save();
      return { success: true };
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async processExcelFile(userId: string, fileBuffer: Buffer) {
    try {
      // 1. Đọc file Excel từ Buffer
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      // 2. Chọn sheet đầu tiên
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 3. Chuyển đổi dữ liệu sheet thành mảng JSON
      const data: any = XLSX.utils.sheet_to_json(worksheet, {
        // header: 1, // Tùy chọn: nếu hàng đầu tiên không phải tiêu đề
        raw: false, // Giữ nguyên định dạng chuỗi
      });

      // 4. Định dạng lại dữ liệu trước khi lưu DB
      const tradesToInsert = data
        .map((row: any) => {
          const isUsdc = row.symbol.endsWith('c');
          console.log('isUsdc', isUsdc);

          const symbol = isUsdc ? row.symbol.slice(0, -1) : row.symbol;
          const lots = isUsdc ? +row.lots / 100 : +row.lots;

          const result = isUsdc ? normalizeNumberString(row.profit_usc) / 100 : normalizeNumberString(row.profit_usd);
          console.log('result', result);

          let closedBy = '';
          switch (row.close_reason) {
            case 'user':
              closedBy = 'MA';
              break;
            case 'sl':
              closedBy = 'SL';
              break;
            case 'tp':
              closedBy = 'TP';
              break;
            case 'so':
              closedBy = 'SO';
              break;
            default:
              closedBy = '';
              break;
          }
          const openTimeUtc = row.opening_time_utc + 'Z';
          const entryTime = new Date(openTimeUtc);
          const closeTimeUtc = row.closing_time_utc + 'Z';
          const closeTime = new Date(closeTimeUtc);
          const diff = moment.duration(moment(closeTime).diff(moment(entryTime)));
          return {
            // Tùy chỉnh các trường, ví dụ:
            patientCode: row['Mã Bệnh Nhân'] || row.patientCode,
            fullName: row['Họ Tên'],
            mobile: row['Số Điện Thoại'],
            // ... đảm bảo các key khớp với Schema MongoDB của bạn

            userId: userId,
            user: userId,

            symbol, // Ví dụ: "BTCUSD"
            tradeSide: row.type.toUpperCase(),
            lots, // Khối lượng giao dịch

            entryPrice: normalizeNumberString(row.opening_price), // Giá vào lệnh
            closePrice: normalizeNumberString(row.closing_price), // Giá đóng lệnh

            entryTime, // Thời gian vào lệnh
            closeTime, // Thời gian đóng lệnh
            duration: `${Math.floor(diff.asHours())}h ${diff.minutes()}m`, // vd: 1h 49m

            takeProfit: normalizeNumberString(row.take_profit) || null, // Mục tiêu chốt lời
            stopLoss: normalizeNumberString(row.stop_loss) || null, // Mức cắt lỗ
            closedBy, // Lý do đóng lệnh ['SL', 'TP', 'BE', 'MA', 'SO']

            result: result?.toFixed(2), // Kết quả (lãi/lỗ)

            reward: (result / 4)?.toFixed(2),
          };
        })
        .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

      // 5. Lưu dữ liệu vào MongoDB
      // Sử dụng insertMany để chèn nhiều document một lần
      const result = await this.tradeModel.insertMany(tradesToInsert);

      return result;
    } catch (error) {
      console.log('error-excel', error);
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }
}
