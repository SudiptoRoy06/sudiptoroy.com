import mongoose from 'mongoose';
import '../models/index.js';

export async function connectDatabase() {
  const { MONGODB_URI, MONGODB_DB } = process.env;
  if (!MONGODB_URI || !MONGODB_DB) throw new Error('MongoDB configuration is missing');
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 10000
  });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  return mongoose.connection;
}

export async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
