import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketAsset } from '../types/market';

interface TickerRibbonProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  recentTickSymbol?: string;
  recentTickDirection?: 'up' | 'down';
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({
  assets,
  onSelectAsset,
  recentTickSymbol,
  recentTickDirection,
}) => {
  // Select key global benchmarks
  const ribbonSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'XAUUSD', 'USOIL', 'EURUSD', 'US10Y'];
  const ribbonAssets = ribbonSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean) as MarketAsset[];

  return (
    <div className="bg-[#131722] text-white border-b border-[#2A2E39] text-xs select-none overflow-x-auto no-scrollbar py-1.5 px-4 shadow-inner">
      <div className="max-w-[1440px] mx-auto flex items-center gap-6 whitespace-nowrap min-w-max">
        <div className="flex items-center gap-1.5 text-[#787B86] text-[11px] font-semibold tracking-wider uppercase pr-2 border-r border-[#2A2E39]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
          Markets
        </div>

        {ribbonAssets.map((asset) => {
          const isTicking = recentTickSymbol === asset.symbol;
          const isBullish = asset.change >= 0;

          return (
            <button
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2 group cursor-pointer transition-all px-2 py-0.5 rounded ${
                isTicking
                  ? recentTickDirection === 'up'
                    ? 'bg-[#089981]/25 ring-1 ring-[#089981]'
                    : 'bg-[#F23645]/25 ring-1 ring-[#F23645]'
                  : 'hover:bg-[#2A2E39]'
              }`}
            >
              <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                {asset.symbol}
              </span>
              <span className="font-mono tabular-nums text-slate-300">
                {asset.category === 'bonds'
                  ? `${asset.price.toFixed(3)}%`
                  : asset.category === 'forex'
                  ? asset.price.toFixed(4)
                  : asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] font-mono tabular-nums font-medium ${
                  isBullish ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                {isBullish ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {isBullish ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
