import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { USER_COLLECTION_NAME } from './constants';

const Schema = mongoose.Schema;

export const UserSchema = new Schema(
  {
    username: { type: String },
    password: { type: String },
    avatar: { type: String },
    features: [{ type: String }],
  },
  {
    collection: USER_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
