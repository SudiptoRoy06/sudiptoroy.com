import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const profileSchema = new mongoose.Schema({
  identity: { type: String, default: 'primary', immutable: true, unique: true },
  headline: { type: String, required: true, trim: true },
  biography: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  availability: { type: Boolean, default: false },
  portrait: { type: String, default: '/images/portrait-placeholder.svg' },
  cv: { type: String, default: null }
}, schemaOptions);

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
