import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { QUOTES_COLLECTION_NAME } from './constants';

const Schema = mongoose.Schema;

export const QuotesSchema = new Schema(
  {
    quote: { type: String, required: true },
    author: { type: String },
    type: { type: String },
  },
  {
    collection: QUOTES_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
