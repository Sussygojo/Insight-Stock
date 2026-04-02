import React from "react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import {
  checkIfInWatchlist,
  getWatchlistSymbolsByEmail,
} from "@/lib/actions/watchlist.actions";

interface StockDetailsPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

async function getCompanyProfile(symbol: string) {
  try {
    const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
    const token =
      process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      return { name: symbol.toUpperCase() };
    }

    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(
      symbol,
    )}&token=${token}`;
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) {
      return { name: symbol.toUpperCase() };
    }
    const data = await response.json();
    return { name: data?.name || symbol.toUpperCase() };
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return { name: symbol.toUpperCase() };
  }
}

const StockDetails = async ({ params }: StockDetailsPageProps) => {
  const { symbol } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userEmail = session?.user?.email;

  // Fetch company profile and watchlist status
  const [companyProfile, isInWatchlist] = await Promise.all([
    getCompanyProfile(symbol),
    userEmail ? checkIfInWatchlist(symbol, userEmail) : Promise.resolve(false),
  ]);

  const scriptUrl =
    "https://s3.tradingview.com/external-embedding/embed-widget-";

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            className="custom-chart"
            height={600}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
            className="custom-chart"
            height={600}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <WatchlistButton
              userEmail="nikhilmanjunm@gmail.com"
              symbol={symbol.toUpperCase()}
              company={symbol.toUpperCase()}
              isInWatchlist={false}
            />
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
};

export default StockDetails;
