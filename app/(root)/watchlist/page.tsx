import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import WatchlistTable from '@/components/WatchlistTable';
import { fetchJSON } from '@/lib/actions/finnhub.actions';
import { StarIcon } from 'lucide-react';

// Function to fetch current stock data with prices
async function enrichWatchlistWithData(watchlistItems: StockWithData[]): Promise<StockWithData[]> {
  const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!token || watchlistItems.length === 0) return watchlistItems;

  const enrichedItems = await Promise.all(
    watchlistItems.map(async (item) => {
      try {
        // Fetch quote and profile data from Finnhub
        const [quoteData, profileData, financialsData] = await Promise.all([
          fetchJSON<QuoteData>(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${token}`, 300).catch(() => null),
          fetchJSON<ProfileData>(`https://finnhub.io/api/v1/stock/profile2?symbol=${item.symbol}&token=${token}`, 1800).catch(() => null),
          fetchJSON<FinancialsData>(`https://finnhub.io/api/v1/stock/metric?symbol=${item.symbol}&metric=all&token=${token}`, 1800).catch(() => null)
        ]);

        const currentPrice = quoteData?.c || 0;
        const changePercent = quoteData?.dp || 0;
        const marketCap = profileData?.marketCapitalization || 0;
        const peRatio = financialsData?.metric?.peBasicExclExtraTTM || financialsData?.metric?.peNormalizedAnnual || 0;

        return {
          ...item,
          currentPrice,
          changePercent,
          priceFormatted: currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : 'N/A',
          changeFormatted: changePercent !== 0 ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%` : 'N/A',
          marketCap: marketCap > 0 ? `$${(marketCap / 1000).toFixed(1)}B` : 'N/A',
          peRatio: peRatio > 0 ? peRatio.toFixed(2) : 'N/A'
        };
      } catch (error) {
        console.error(`Error enriching data for ${item.symbol}:`, error);
        return {
          ...item,
          priceFormatted: 'N/A',
          changeFormatted: 'N/A',
          marketCap: 'N/A',
          peRatio: 'N/A'
        };
      }
    })
  );

  return enrichedItems;
}

export default async function WatchlistPage() {
  const watchlistItems = await getUserWatchlist();
  const enrichedWatchlist = await enrichWatchlistWithData(watchlistItems);

  if (enrichedWatchlist.length === 0) {
    return (
      <div className="watchlist-empty-container">
        <div className="watchlist-empty">
          <StarIcon className="watchlist-star" />
          <h2 className="empty-title">Your watchlist is empty</h2>
          <p className="empty-description">
            Start building your watchlist by searching for stocks and adding them to track your investments.
          </p>
          <a 
            href="/search"
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Search Stocks
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="watchlist-title">My Watchlist</h1>
        <p className="text-gray-400">
          {enrichedWatchlist.length} stock{enrichedWatchlist.length !== 1 ? 's' : ''} tracked
        </p>
      </div>

      <WatchlistTable watchlist={enrichedWatchlist} />
    </div>
  );
}