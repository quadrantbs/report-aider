import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI:", MONGO_URI);
console.log("ReadyState:", mongoose.connection.readyState);

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {

    cached.promise = mongoose.connect(MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB error:", err);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;