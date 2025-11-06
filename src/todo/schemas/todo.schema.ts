import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { TODO_COLLECTION_NAME } from './constants';
import { USER_COLLECTION_NAME } from '../../users/schemas/constants';

const Schema = mongoose.Schema;

export const TodoSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    date: { type: Date },
    formatDate: { type: String },
    done: { type: Boolean, default: false },
    doneDate: { type: Date },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    userId: { type: String },
    user: { type: Schema.Types.ObjectId, ref: USER_COLLECTION_NAME },
    isDeleted: { type: Boolean, default: false },
  },
  {
    collection: TODO_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
