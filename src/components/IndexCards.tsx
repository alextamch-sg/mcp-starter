import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface IndexCardsProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  recentTickSymbol?: string;
}

type Timeframe = '1D' | '5D' | '1M' | '3M' | '1Y' | 'ALL';

export const IndexCards: React.FC<IndexCardsProps> = ({
  assets,
  onSelectAsset,
  recentTickSymbol,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');

  // Key hero indices/benchmarks
  const indexSymbols = ['SPX', 'NDX', 'DJI', 'RUT', 'BTCUSD', 'US10Y'];
  const indexAssets = indexSymbols
    .map((s) => assets.find((a) => a.symbol === s))
    .filter(Boolean) as MarketAsset[];

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '1Y', 'ALL'];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#131722] font-display">
            Major Indices & Benchmarks
          </h2>
          <p className="text-xs text-[#787B86] mt-0.5">
            Real-time global equity indices, digital assets, and sovereign debt benchmarks
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#F0F3FA] rounded-lg self-start sm:self-auto border border-[#E0E3EB]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                selectedTimeframe === tf
                  ? 'bg-white text-[#131722] shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Index Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {indexAssets.map((asset) => {
          const isTicking = recentTickSymbol === asset.symbol;
          const isBullish = asset.change >= 0;

          // Multiply or slice sparkline slightly based on timeframe for interactive effect
          let displaySparkline = asset.sparkline;
          if (selectedTimeframe === '5D') {
            displaySparkline = asset.sparkline.slice(-10);
          } else if (selectedTimeframe === '1M') {
            displaySparkline = asset.sparkline.map((v, i) => v * (1 + (i % 3 === 0 ? 0.005 : -0.002)));
          }

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`group bg-white rounded-xl p-3.5 border border-[#E0E3EB] hover:border-[#2962FF] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isTicking ? (isBullish ? 'ring-2 ring-[#089981]/50' : 'ring-2 ring-[#F23645]/50') : ''
              }`}
            >
              {/* Top row: Avatar Badge + Symbol + Name */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: asset.badgeBg }}
                  >
                    {asset.badgeText}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-[#131722] truncate group-hover:text-[#2962FF] transition-colors">
                        {asset.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#787B86] truncate max-w-[100px]">
                      {asset.name}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#787B86] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Middle row: Price & Sparkline */}
              <div className="my-2.5 flex items-end justify-between gap-2">
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-[#131722]">
                    {asset.category === 'bonds'
                      ? `${asset.price.toFixed(3)}%`
                      : asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`flex items-center text-xs font-mono tabular-nums font-semibold mt-0.5 ${
                      isBullish ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isBullish ? '+' : ''}
                    {asset.change.toFixed(2)}{' '}
                    <span className="ml-1">
                      ({isBullish ? '+' : ''}
                      {asset.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-20">
                  <Sparkline
                    data={displaySparkline}
                    width={80}
                    height={32}
                    isPositive={isBullish}
                  />
                </div>
              </div>

              {/* Bottom Micro Footer: Range or Status */}
              <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-[10px] text-[#787B86]">
                <span>Vol {asset.volume}</span>
                <span
                  className={`font-semibold ${
                    asset.technicalRating.includes('Buy')
                      ? 'text-[#089981]'
                      : asset.technicalRating.includes('Sell')
                      ? 'text-[#F23645]'
                      : 'text-[#787B86]'
                  }`}
                >
                  {asset.technicalRating}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
