import mongoose from "mongoose";

const globalAny = global as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const cached = globalAny.mongoose ?? (globalAny.mongoose = { conn: null, promise: null });

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      autoIndex: true,
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
