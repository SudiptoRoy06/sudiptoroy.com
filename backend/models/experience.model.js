import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, default: '' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  summary: { type: String, required: true },
  sortOrder: { type: Number, required: true, default: 0 }
}, schemaOptions);

export const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
