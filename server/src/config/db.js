import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.MONGODB_URI) {
  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn(`[WARN] Server will continue running, but MongoDB connection is required for data operations (${uri}).`);
    throw err;
  }
}
