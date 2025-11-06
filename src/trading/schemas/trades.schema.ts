import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { TRADES_COLLECTION_NAME } from './constants';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../../users/schemas/constants';

const Schema = mongoose.Schema;

export const TradesSchema = new Schema(
  {
    userId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: USER_COLLECTION_NAME },
    userSetting: { type: Schema.Types.ObjectId, ref: USER_SETTING_COLLECTION_NAME },

    symbol: { type: String, required: true }, // Ví dụ: "BTC/USD"
    tradeSide: { type: String, enum: ['BUY', 'SELL'], required: true },
    volume: { type: Number, required: true }, // Khối lượng giao dịch

    entryPrice: { type: Number, required: true }, // Giá vào lệnh
    closePrice: { type: Number }, // Giá đóng lệnh

    entryTime: { type: Date, required: true }, // Thời gian vào lệnh
    closeTime: { type: Date }, // Thời gian đóng lệnh

    takeProfit: { type: Number }, // Mục tiêu chốt lời
    stopLoss: { type: Number }, // Mức cắt lỗ
    closedBy: { type: String }, // Lý do đóng lệnh ['SL', 'TP', 'BE', 'MA', 'SO']

    result: { type: Number }, // Kết quả (lãi/lỗ)
    rating: { type: Number, min: 0, max: 5 }, // Đánh giá cá nhân (0–5)
    yourThought: { type: String }, // Ghi chú hoặc cảm nghĩ sau trade

    reward: { type: Number },

    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: TRADES_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
