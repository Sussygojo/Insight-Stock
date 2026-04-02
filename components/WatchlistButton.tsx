"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkIfInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";

interface WatchlistButtonProps {
  symbol: string;
  company?: string;
  isInWatchlist?: boolean;
  userEmail: string;
  showTrashIcon?: boolean;
  type?: "button" | "icon";
  onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
}

const WatchlistButton = ({
  symbol,
  company = "",
  isInWatchlist: initialIsInWatchlist = false,
  userEmail,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verify watchlist status on component mount if server-provided state differs
    if (userEmail) {
      checkIfInWatchlist(symbol, userEmail).then((status) => {
        if (status !== initialIsInWatchlist) {
          setIsInWatchlist(status);
        }
      });
    }
  }, [symbol, userEmail, initialIsInWatchlist]);

  const handleWatchlistToggle = async () => {
    if (!userEmail) {
      console.error("User email not provided");
      return;
    }

    setLoading(true);
    try {
      const success = isInWatchlist
        ? await removeFromWatchlist(symbol, userEmail)
        : await addToWatchlist(symbol, company || symbol, userEmail);

      if (success) {
        setIsInWatchlist(!isInWatchlist);
        onWatchlistChange?.(symbol, !isInWatchlist);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (type === "icon") {
    return (
      <button
        onClick={handleWatchlistToggle}
        disabled={loading}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        <Heart
          size={24}
          className={`${
            isInWatchlist
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-500"
          } transition-colors`}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleWatchlistToggle}
      disabled={loading}
      variant={isInWatchlist ? "default" : "outline"}
      className={`w-full ${
        isInWatchlist
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
      }`}
    >
      <Heart
        size={18}
        className={`mr-2 ${isInWatchlist ? "fill-current" : ""}`}
      />
      {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
    </Button>
  );
};

export default WatchlistButton;
