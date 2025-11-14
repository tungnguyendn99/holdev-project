import * as mongoose from 'mongoose';
import * as jsonMongo from '@meanie/mongoose-to-json';
import { ENGLISH_WORDS_COLLECTION_NAME } from './constants';

const Schema = mongoose.Schema;

const WordResultSchema = new mongoose.Schema({
  definition: { type: String, required: true },
  partOfSpeech: { type: String },
  synonyms: [String],
  antonyms: [String],
  typeOf: [String],
  hasTypes: [String],
  hasParts: [String],
  inCategory: [String],
  similarTo: [String],
  also: [String],
  examples: [String],
});

export const EnglishWordsSchema = new Schema(
  {
    word: { type: String, required: true },
    results: [WordResultSchema],
    syllables: {
      count: Number,
      list: [String],
    },
    pronunciation: {
      all: String,
      noun: String,
      verb: String,
      adj: String,
    },
    frequency: Number,
    translate: { type: String }
  },
  {
    collection: ENGLISH_WORDS_COLLECTION_NAME,
    timestamps: true,
  },
).plugin(jsonMongo);
