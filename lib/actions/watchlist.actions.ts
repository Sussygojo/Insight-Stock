"use server";

import { connectToDatabase } from "@/database/mongoose";

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    // Find user by email
    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { id: 1 } });

    if (!user) {
      return [];
    }

    // Get watchlist symbols for the user
    const watchlistItems = await db
      .collection("watchlist")
      .find({ userId: user.id }, { projection: { symbol: 1 } })
      .toArray();

    return watchlistItems.map((item) => item.symbol);
  } catch (error) {
    console.error("Error fetching watchlist symbols:", error);
    return [];
  }
}

export async function checkIfInWatchlist(
  symbol: string,
  email: string,
): Promise<boolean> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { id: 1 } });

    if (!user) {
      return false;
    }

    const item = await db.collection("watchlist").findOne({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    });

    return !!item;
  } catch (error) {
    console.error("Error checking watchlist status:", error);
    return false;
  }
}

export async function addToWatchlist(
  symbol: string,
  company: string,
  email: string,
): Promise<boolean> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { id: 1 } });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await db.collection("watchlist").insertOne({
      userId: user.id,
      symbol: symbol.toUpperCase(),
      company,
      addedAt: new Date(),
    });

    return !!result.insertedId;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return false;
  }
}

export async function removeFromWatchlist(
  symbol: string,
  email: string,
): Promise<boolean> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    const user = await db
      .collection("user")
      .findOne({ email }, { projection: { id: 1 } });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await db.collection("watchlist").deleteOne({
      userId: user.id,
      symbol: symbol.toUpperCase(),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
}
