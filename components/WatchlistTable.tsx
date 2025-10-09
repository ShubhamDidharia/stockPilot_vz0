'use client';

import { useState } from 'react';
import Link from 'next/link';
import WatchlistButton from '@/components/WatchlistButton';
import { removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import { toast } from 'sonner';

export default function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const [items, setItems] = useState<StockWithData[]>(watchlist);

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      const result = await removeFromWatchlist(symbol);
      
      if (result.success) {
        setItems(prev => prev.filter(item => item.symbol !== symbol));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to remove from watchlist');
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    if (!isAdded) {
      handleRemoveFromWatchlist(symbol);
    }
  };

  return (
    <div className="watchlist-table">
      <table className="w-full">
        <thead>
          <tr className="table-header-row">
            {WATCHLIST_TABLE_HEADER.map((header) => (
              <th key={header} className="table-header px-4 py-3 text-left text-sm font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr 
              key={item.symbol}
              className="border-b border-gray-600 hover:bg-gray-700/50 transition-colors"
            >
              <td className="px-4 py-4">
                <Link
                  href={`/stocks/${item.symbol}`}
                  className="flex flex-col hover:text-yellow-500 transition-colors"
                >
                  <span className="font-medium text-gray-100">{item.company}</span>
                  <span className="text-sm text-gray-400">{item.symbol}</span>
                </Link>
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/stocks/${item.symbol}`}
                  className="font-mono text-gray-100 hover:text-yellow-500 transition-colors"
                >
                  {item.symbol}
                </Link>
              </td>
              <td className="px-4 py-4">
                <span className="font-mono text-gray-100">
                  {item.priceFormatted || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4">
                <span 
                  className={`font-mono ${
                    item.changePercent && item.changePercent > 0 
                      ? 'text-green-400' 
                      : item.changePercent && item.changePercent < 0 
                      ? 'text-red-400' 
                      : 'text-gray-400'
                  }`}
                >
                  {item.changeFormatted || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="font-mono text-gray-100">
                  {item.marketCap || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="font-mono text-gray-100">
                  {item.peRatio || 'N/A'}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="text-gray-400 text-sm">
                  No alerts
                </span>
              </td>
              <td className="px-4 py-4">
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={true}
                  enableServerActions={false}
                  onWatchlistChange={handleWatchlistChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}