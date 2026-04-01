"use server";

import { NextRequest } from "next/server";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

interface FinnhubArticle {
  id: number;
  headline: string;
  summary: string;
  url: string;
  image: string;
  datetime: number;
  related: string;
  source: string;
}

interface FormattedArticle {
  id: string;
  headline: string;
  summary: string;
  url: string;
  image: string;
  datetime: number;
  symbol?: string;
}

async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> {
  const options: RequestInit = {
    headers: {
      "X-Finnhub-Token": FINNHUB_API_KEY || "",
    },
  };

  if (revalidateSeconds) {
    options.next = { revalidate: revalidateSeconds };
    options.cache = "force-cache";
  } else {
    options.cache = "no-store";
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `Finnhub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function isValidArticle(article: any): article is FinnhubArticle {
  return (
    article &&
    typeof article.id === "number" &&
    typeof article.headline === "string" &&
    typeof article.summary === "string" &&
    typeof article.url === "string" &&
    typeof article.datetime === "number" &&
    article.headline.trim() !== "" &&
    article.summary.trim() !== ""
  );
}

function formatArticle(
  article: FinnhubArticle,
  symbol?: string,
): FormattedArticle {
  return {
    id: article.id.toString(),
    headline: article.headline,
    summary: article.summary,
    url: article.url,
    image: article.image || "",
    datetime: article.datetime,
    symbol,
  };
}

export async function getNews(symbols?: string[]): Promise<FormattedArticle[]> {
  try {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 5);

    const to = Math.floor(toDate.getTime() / 1000);
    const from = Math.floor(fromDate.getTime() / 1000);

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (cleanSymbols.length === 0) {
        throw new Error("No valid symbols provided");
      }

      const articles: FormattedArticle[] = [];
      const maxRounds = Math.min(6, cleanSymbols.length);

      // Round-robin through symbols, max 6 times
      for (let round = 0; round < maxRounds; round++) {
        for (const symbol of cleanSymbols) {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}`;
            const companyNews = await fetchJSON<FinnhubArticle[]>(url);

            // Find first valid article
            const validArticle = companyNews.find(isValidArticle);
            if (validArticle) {
              articles.push(formatArticle(validArticle, symbol));
              break; // Found one for this round
            }
          } catch (error) {
            console.error(`Error fetching news for ${symbol}:`, error);
            continue;
          }
        }

        if (articles.length >= 6) break;
      }

      // Sort by datetime descending
      return articles.sort((a, b) => b.datetime - a.datetime);
    } else {
      // General market news
      const url = `${FINNHUB_BASE_URL}/news?category=general&minId=0`;
      const generalNews = await fetchJSON<FinnhubArticle[]>(url);

      // Deduplicate and validate
      const seen = new Set<string>();
      const validArticles = generalNews
        .filter((article) => {
          if (!isValidArticle(article)) return false;
          const key = `${article.id}-${article.url}-${article.headline}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 6)
        .map((article) => formatArticle(article));

      return validArticles;
    }
  } catch (error) {
    console.error("Failed to fetch news:", error);
    throw new Error("Failed to fetch news");
  }
}
