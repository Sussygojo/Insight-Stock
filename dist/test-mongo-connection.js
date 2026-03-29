"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MongoDB_URI;
if (!MONGODB_URI) {
    console.error("❌ Missing MongoDB_URI in environment (e.g. .env file)");
    process.exit(1);
}
const MONGODB_URI_STRING = MONGODB_URI;
async function testConnection() {
    try {
        await mongoose_1.default.connect(MONGODB_URI_STRING, {
            bufferCommands: false,
            dbName: "admin",
        });
        console.log("✅ MongoDB connection successful");
    }
    catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🛑 MongoDB connection closed");
    }
}
testConnection();
