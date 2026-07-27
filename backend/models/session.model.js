import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true, select: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expiresAt: { type: Date, required: true }
}, schemaOptions);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
