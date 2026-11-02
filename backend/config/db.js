import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured. Copy backend/.env.example to backend/.env.');
  mongoose.connection.on('connected', () => console.info('MongoDB connected.'));
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected.'));
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
}
