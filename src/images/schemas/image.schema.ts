import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { IMAGE_COLLECTION_NAME } from './constants';
import { USER_COLLECTION_NAME } from '../../users/schemas/constants';

const Schema = mongoose.Schema;

export const ImageSchema = new Schema(
  {
    publicId: { type: String },
    url: { type: String },
    width: { type: String },
    height: { type: String },
    format: { type: String },
    size: { type: String },
    folder: { type: String },
    altText: { type: String },
    userId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: USER_COLLECTION_NAME },
    type: { type: String }, //theo features
  },
  {
    collection: IMAGE_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
