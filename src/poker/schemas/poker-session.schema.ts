import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from '../../users/schemas/constants';
import { POKER_SESSION_COLLECTION_NAME } from './constants';

const Schema = mongoose.Schema;

export const PokerSessionSchema = new Schema(
  {
    userId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: USER_COLLECTION_NAME },

    blind: { type: String, required: true },
    format: { type: String, required: true }, // 8max straddle

    totalBefore: { type: Number, required: true }, // Tổng hands trước session
    totalAfter: { type: Number }, // Tổng hands sau session
    hands: { type: Number }, // after - before

    startTime: { type: Date, required: true }, // Thời gian bắt đầu session
    endTime: { type: Date }, // Thời gian kết thúc session
    duration: { type: String }, // vd: 1h 49m

    result: { type: Number }, // Kết quả (lãi/lỗ)$
    resultBB: { type: Number }, // Kết quả theo big blind

    rating: { type: Number, min: 0, max: 5 }, // Đánh giá cá nhân (0–5)

    yourThought: { type: String }, // Ghi chú hoặc cảm nghĩ sau trade

    winrate: { type: Number }, // Tỷ lệ thắng trong session (?bb/100 hands)

    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: POKER_SESSION_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
