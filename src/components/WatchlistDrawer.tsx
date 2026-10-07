import React from 'react';
import { MarketAsset, PriceAlert } from '../types/market';
import { Sparkline } from './Sparkline';
import { X, Trash2, Bell, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  assets: MarketAsset[];
  onRemoveWatchlist: (symbol: string) => void;
  onSelectAsset: (asset: MarketAsset) => void;
  alerts: PriceAlert[];
  onRemoveAlert: (alertId: string) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  assets,
  onRemoveWatchlist,
  onSelectAsset,
  alerts,
  onRemoveAlert,
}) => {
  if (!isOpen) return null;

  const watchlistedAssets = watchlistSymbols
    .map((s) => assets.find((a) => a.symbol === s))
    .filter(Boolean) as MarketAsset[];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E0E3EB] animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E0E3EB] flex items-center justify-between bg-[#FAF9FF]">
          <div>
            <h3 className="font-bold text-base text-[#131722] font-display">
              Custom Watchlist & Alerts
            </h3>
            <p className="text-xs text-[#787B86]">
              {watchlistSymbols.length} active symbols tracked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#787B86] hover:text-[#131722] hover:bg-[#E0E3EB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB]">
          {/* Section 1: Watchlist Symbols */}
          <div className="p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#787B86]">
              Tracked Assets
            </div>

            {watchlistedAssets.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#787B86]">
                Your watchlist is empty. Bookmark assets using the star icon in the screener table!
              </div>
            ) : (
              <div className="space-y-2">
                {watchlistedAssets.map((asset) => {
                  const isBull = asset.change >= 0;
                  return (
                    <div
                      key={asset.symbol}
                      onClick={() => {
                        onSelectAsset(asset);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg border border-[#E0E3EB] hover:border-[#2962FF] hover:bg-[#FAF9FF] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: asset.badgeBg }}
                        >
                          {asset.badgeText}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#131722] group-hover:text-[#2962FF] transition-colors">
                            {asset.symbol}
                          </div>
                          <div className="text-[10px] text-[#787B86] truncate max-w-[90px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-[#131722]">
                            ${asset.price.toFixed(2)}
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveWatchlist(asset.symbol);
                          }}
                          className="text-[#787B86] hover:text-[#F23645] p-1 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Price Alerts */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#787B86]">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#2962FF]" />
                Price Alerts
              </span>
              <span>{alerts.length} Active</span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#787B86]">
                No price alerts set. Open any asset chart to configure trigger alerts.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-2.5 rounded-lg bg-[#F0F3FA] flex items-center justify-between text-xs border border-[#E0E3EB]"
                  >
                    <div>
                      <div className="font-bold text-[#131722]">
                        {al.symbol} {al.condition === 'above' ? '≥' : '≤'} ${al.targetPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#787B86]">
                        Created {new Date(al.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveAlert(al.id)}
                      className="text-[#787B86] hover:text-[#F23645] p-1"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
