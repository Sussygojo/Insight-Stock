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
