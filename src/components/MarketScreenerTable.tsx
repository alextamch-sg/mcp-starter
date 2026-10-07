import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';

interface MarketScreenerTableProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  recentTickSymbol?: string;
}

type ScreenerFilter = 'all' | 'most_active' | 'gainers' | 'losers' | 'strong_buy' | 'near_highs';
type CategoryFilter = 'all' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';
type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeRaw' | 'technicalScore';

export const MarketScreenerTable: React.FC<MarketScreenerTableProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleWatchlist,
  recentTickSymbol,
}) => {
  const [activeFilter, setActiveFilter] = useState<ScreenerFilter>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('volumeRaw');
  const [sortAsc, setSortAsc] = useState(false);

  // Tab filters
  const filterTabs: { id: ScreenerFilter; label: string }[] = [
    { id: 'all', label: 'All Markets' },
    { id: 'most_active', label: 'Most Active' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'strong_buy', label: 'Strong Buy' },
    { id: 'near_highs', label: '52W Highs' },
  ];

  // Category filter buttons
  const categoryFilters: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Classes' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'bonds', label: 'Bonds' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAssets = useMemo(() => {
    let list = [...assets];

    // Filter by category
    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory);
    }

    // Filter by screener tab
    if (activeFilter === 'gainers') {
      list = list.filter((a) => a.changePercent > 0);
    } else if (activeFilter === 'losers') {
      list = list.filter((a) => a.changePercent < 0);
    } else if (activeFilter === 'strong_buy') {
      list = list.filter((a) => a.technicalRating === 'Strong Buy');
    } else if (activeFilter === 'near_highs') {
      list = list.filter((a) => {
        const range = a.range52w.high - a.range52w.low;
        const pos = (a.price - a.range52w.low) / (range || 1);
        return pos >= 0.85;
      });
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA ?? 0) - (valB ?? 0) : (valB ?? 0) - (valA ?? 0);
    });

    return list;
  }, [assets, activeCategory, activeFilter, searchQuery, sortField, sortAsc]);

  return (
    <div className="bg-white rounded-xl border border-[#E0E3EB] shadow-xs overflow-hidden">
      {/* Header controls bar */}
      <div className="p-4 border-b border-[#E0E3EB] flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#131722] font-display">
              Markets Screener & Data Matrix
            </h3>
            <p className="text-xs text-[#787B86] mt-0.5">
              Multi-asset real-time pricing, technical indicators, and valuation metrics
            </p>
          </div>

          {/* Quick Search in Screener */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-[#787B86] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by symbol or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-[#F0F3FA] text-xs text-[#131722] rounded-lg border border-transparent focus:border-[#2962FF] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Screener Tabs & Category Rails */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-[#F0F3FA]">
          {/* Screener Presets */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#131722] text-white shadow-xs'
                      : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Asset Category Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] rounded-lg border border-[#E0E3EB] overflow-x-auto no-scrollbar self-stretch sm:self-auto">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#131722] shadow-xs'
                      : 'text-[#787B86] hover:text-[#131722]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9FF] border-b border-[#E0E3EB] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider select-none">
              <th className="py-2.5 pl-4 pr-2 w-10"></th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol / Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Chg %</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('technicalScore')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Technical Rating</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volumeRaw')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">
                Market Cap
              </th>
              <th className="py-2.5 px-3 text-center hidden lg:table-cell w-36">
                52W Range
              </th>
              <th className="py-2.5 px-3 text-center hidden sm:table-cell w-28">
                Trend (30D)
              </th>
              <th className="py-2.5 pr-4 pl-2 text-right w-16">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E3EB] text-xs">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#787B86]">
                  <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-[#787B86]/50" />
                  No assets match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isWatchlisted = watchlistSymbols.includes(asset.symbol);
                const isTicking = recentTickSymbol === asset.symbol;
                const isBullish = asset.change >= 0;

                // 52W range relative percentage
                const rangeDiff = asset.range52w.high - asset.range52w.low;
                const currentRangePct = Math.min(
                  100,
                  Math.max(0, ((asset.price - asset.range52w.low) / (rangeDiff || 1)) * 100)
                );

                return (
                  <tr
                    key={asset.symbol}
                    className={`group hover:bg-[#F8FAFD] transition-colors cursor-pointer ${
                      isTicking ? (isBullish ? 'bg-[#089981]/5' : 'bg-[#F23645]/5') : ''
                    }`}
                    onClick={() => onSelectAsset(asset)}
                  >
                    {/* Watchlist Star */}
                    <td
                      className="py-3 pl-4 pr-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(asset.symbol);
                      }}
                    >
                      <button
                        title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className="text-[#787B86] hover:text-[#2962FF] transition-colors p-1"
                      >
                        {isWatchlisted ? (
                          <BookmarkCheck className="w-4 h-4 text-[#2962FF] fill-[#2962FF]" />
                        ) : (
                          <Bookmark className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                        )}
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                          style={{ backgroundColor: asset.badgeBg }}
                        >
                          {asset.badgeText}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#131722] group-hover:text-[#2962FF] transition-colors">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] text-[#787B86] font-medium hidden sm:inline">
                              {asset.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787B86] truncate max-w-[140px] sm:max-w-[200px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold font-mono tabular-nums text-[#131722]">
                        {asset.category === 'bonds'
                          ? `${asset.price.toFixed(3)}%`
                          : asset.category === 'forex'
                          ? asset.price.toFixed(4)
                          : asset.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </div>
                      <div className="text-[10px] text-[#787B86] font-mono tabular-nums">
                        {isBullish ? '+' : ''}
                        {asset.change.toFixed(2)}
                      </div>
                    </td>

                    {/* Change % Badge */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded ${
                          isBullish
                            ? 'text-[#089981] bg-[#089981]/10'
                            : 'text-[#F23645] bg-[#F23645]/10'
                        }`}
                      >
                        {isBullish ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        {isBullish ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          asset.technicalRating === 'Strong Buy'
                            ? 'bg-[#089981] text-white'
                            : asset.technicalRating === 'Buy'
                            ? 'bg-[#089981]/20 text-[#089981]'
                            : asset.technicalRating === 'Neutral'
                            ? 'bg-slate-100 text-[#787B86]'
                            : asset.technicalRating === 'Sell'
                            ? 'bg-[#F23645]/20 text-[#F23645]'
                            : 'bg-[#F23645] text-white'
                        }`}
                      >
                        {asset.technicalRating}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#434656]">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#434656] hidden md:table-cell">
                      {asset.marketCap ?? '—'}
                    </td>

                    {/* 52W Range Bar */}
                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <div className="w-28 mx-auto">
                        <div className="flex justify-between text-[10px] text-[#787B86] font-mono tabular-nums mb-1">
                          <span>{asset.range52w.low.toFixed(0)}</span>
                          <span>{asset.range52w.high.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-[#E0E3EB] h-1.5 rounded-full overflow-hidden relative">
                          <div
                            className="bg-[#2962FF] h-full rounded-full"
                            style={{ width: `${currentRangePct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Trend Sparkline */}
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <div className="inline-block">
                        <Sparkline
                          data={asset.sparkline}
                          width={75}
                          height={26}
                          isPositive={isBullish}
                        />
                      </div>
                    </td>

                    {/* Interactive Chart Action */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="p-1.5 text-[#787B86] hover:text-[#2962FF] hover:bg-[#F0F3FA] rounded-md transition-colors"
                        title={`Open ${asset.symbol} interactive chart`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary Bar */}
      <div className="p-3 bg-[#FAF9FF] border-t border-[#E0E3EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#787B86]">
        <div>
          Showing <span className="font-semibold text-[#131722]">{filteredAssets.length}</span> of{' '}
          <span className="font-semibold text-[#131722]">{assets.length}</span> assets
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Data refreshed dynamically in real-time</span>
          <span className="text-[#2962FF] font-semibold">Click any row to open full technical chart</span>
        </div>
      </div>
    </div>
  );
};
