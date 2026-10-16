import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.MONGODB_URI) {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    return conn;
  } catch (err) {
    const localUri = 'mongodb://127.0.0.1:27017/venfes';
    if (uri !== localUri) {
      console.warn(`[WARN] Primary MongoDB connection failed (${err.message}). Attempting fallback to local MongoDB (${localUri})...`);
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 5000
        });
        console.log(`[INFO] Successfully connected to fallback local MongoDB at ${localUri}`);
        return localConn;
      } catch (localErr) {
        console.error('[ERROR] Local MongoDB fallback also failed:', localErr.message);
      }
    }
    console.error('MongoDB connection error:', err.message);
    console.warn(`[WARN] Server will continue running, but MongoDB connection is required for data operations (${uri}).`);
    throw err;
  }
}
