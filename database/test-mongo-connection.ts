import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MongoDB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MongoDB_URI in environment (e.g. .env file)");
  process.exit(1);
}

const MONGODB_URI_STRING: string = MONGODB_URI;

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI_STRING, {
      bufferCommands: false,
      dbName: "admin",
    });

    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🛑 MongoDB connection closed");
  }
}

testConnection();
