import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false }
}, { ...schemaOptions, timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
