import mongoose from 'mongoose';
import { schemaOptions } from './schema-options.js';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true },
  url: { type: String, default: '' },
  repositoryUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  published: { type: Boolean, default: false },
  sortOrder: { type: Number, required: true, default: 0 }
}, schemaOptions);

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
