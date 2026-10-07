import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Stocks', 'Crypto', 'Forex', 'Indices', 'Commodities', 'Bonds'];

  const filtered = assets.filter((asset) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      asset.category.toLowerCase() === selectedFilter.toLowerCase() ||
      (selectedFilter === 'Indices' && asset.category === 'indices');

    const matchesQuery =
      asset.symbol.toLowerCase().includes(query.toLowerCase().trim()) ||
      asset.name.toLowerCase().includes(query.toLowerCase().trim()) ||
      (asset.sector && asset.sector.toLowerCase().includes(query.toLowerCase().trim()));

    return matchesFilter && matchesQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E0E3EB] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2962FF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbols, indices, commodities (e.g. NVDA, BTC, SPX)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm text-[#131722] bg-transparent focus:outline-none placeholder:text-[#787B86]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787B86] hover:text-[#131722]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[#F0F3FA] border border-[#E0E3EB] rounded text-[#787B86] font-mono">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-3.5 py-2 border-b border-[#E0E3EB] bg-[#FAF9FF] flex items-center gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedFilter === cat
                  ? 'bg-[#131722] text-white'
                  : 'text-[#787B86] hover:text-[#131722] hover:bg-[#E0E3EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB] max-h-96">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#787B86]">
              No financial symbols found matching "{query}"
            </div>
          ) : (
            filtered.map((asset) => {
              const isBull = asset.change >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#F8FAFD] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: asset.badgeBg }}
                    >
                      {asset.badgeText}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#131722] group-hover:text-[#2962FF] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-[#787B86] font-medium uppercase">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787B86] truncate max-w-xs">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-mono font-bold text-xs text-[#131722]">
                        {asset.category === 'bonds'
                          ? `${asset.price.toFixed(3)}%`
                          : `$${asset.price.toFixed(2)}`}
                      </div>
                      <div
                        className={`font-mono text-[11px] font-semibold flex items-center justify-end ${
                          isBull ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isBull ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#787B86] group-hover:text-[#2962FF] transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 bg-[#FAF9FF] border-t border-[#E0E3EB] text-[11px] text-[#787B86] flex items-center justify-between px-4">
          <span>Click symbol to inspect real-time chart</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
