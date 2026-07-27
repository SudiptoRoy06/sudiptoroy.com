import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sortOrder: { type: Number, required: true, default: 0 }
}, schemaOptions);

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
