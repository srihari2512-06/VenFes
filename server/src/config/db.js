import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.MONGODB_URI) {
  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (env.NODE_ENV === 'production') process.exit(1);
    throw err;
  }
}
