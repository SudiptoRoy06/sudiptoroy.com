import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const contentBlockSchema = new mongoose.Schema({
  heading: { type: String, default: '', trim: true },
  body: { type: String, required: true, trim: true },
  logo: { type: String, default: '', trim: true },
  image: { type: String, default: '', trim: true },
  images: { type: [String], default: [] },
  url: { type: String, default: '', trim: true },
  linkLabel: { type: String, default: '', trim: true },
  publishedAt: { type: String, default: '', trim: true }
}, { _id: false });

const customSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  intro: { type: String, default: '', trim: true },
  presentation: { type: String, enum: ['section', 'page'], default: 'section' },
  itemPresentation: { type: String, enum: ['modal', 'page'], default: 'modal' },
  blocks: { type: [contentBlockSchema], default: [] },
  published: { type: Boolean, default: true },
  sortOrder: { type: Number, required: true, default: 0 }
}, schemaOptions);

customSectionSchema.index({ slug: 1 }, { unique: true });

export const CustomSection = mongoose.models.CustomSection || mongoose.model('CustomSection', customSectionSchema);
