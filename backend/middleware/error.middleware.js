import mongoose from 'mongoose';

export const notFound = (_req, res) => res.status(404).json({ error: 'Not found' });

export function errorHandler(error, _req, res, _next) {
  if (error?.code === 11000) return res.status(409).json({ error: 'A unique value already exists' });
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ error: 'Invalid identifier' });
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ error: 'Invalid data' });
  if (error instanceof mongoose.Error.MongooseServerSelectionError || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  console.error('Request failed:', error?.message || 'Unknown error');
  return res.status(500).json({ error: 'Internal server error' });
}
