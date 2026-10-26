
import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// Use public DNS resolvers for MongoDB Atlas SRV lookups.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    dbName: 'imovis',
    serverSelectionTimeoutMS: 10000
  });

  console.log('[db] connected');
}
