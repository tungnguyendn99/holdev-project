import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { USER_COLLECTION_NAME, USER_SETTING_COLLECTION_NAME } from './constants';

const Schema = mongoose.Schema;

export const UserSettingSchema = new Schema(
  {
    userId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: USER_COLLECTION_NAME },
    type: { type: String, enum: ['TRADING', 'POKER'], required: true },
    identity: { type: String, enum: ['REAL', 'DEMO'], required: true },
    monthlyTarget: { type: Number, default: 0 },
    plan: { type: String },
    risk: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: (v: any) => typeof v === 'string' || typeof v === 'number',
        message: (props) => `${props.value} must be a string or a number`,
      },
    },
    rule: { type: String },
    note: { type: String },
  },
  {
    collection: USER_SETTING_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
