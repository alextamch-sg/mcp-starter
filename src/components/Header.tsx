import React from 'react';
import { Search, Bookmark, Activity } from 'lucide-react';
import { AssetCategory } from '../types/market';

interface HeaderProps {
  activeTab: AssetCategory | 'overview';
  onSelectTab: (tab: AssetCategory | 'overview') => void;
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  watchlistCount: number;
  isLiveUpdating: boolean;
  onToggleLive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenWatchlist,
  watchlistCount,
  isLiveUpdating,
  onToggleLive,
}) => {
  const navItems: { id: AssetCategory | 'overview'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0E3EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Zone (Single text element wordmark with icon) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded bg-[#131722] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm">
            <span className="text-[#2962FF] mr-0.5">/</span>/
          </div>
          <button
            onClick={() => onSelectTab('overview')}
            className="text-lg font-extrabold tracking-tight text-[#131722] font-display hover:text-[#2962FF] transition-colors text-left"
          >
            Market Precision
          </button>
        </div>

        {/* Zone 2: Navigation Links (4-6 single-line links with clean underlines) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#131722] font-semibold bg-[#F0F3FA]'
                    : 'text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Search omnibar pill, Watchlist trigger, Live tick button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 h-9 px-3 bg-[#F0F3FA] hover:bg-[#E0E3EB] text-[#787B86] hover:text-[#131722] rounded-full text-xs font-medium transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-[#2962FF]"
            title="Search symbols (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search markets</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-[#E0E3EB] rounded text-[#787B86] font-mono">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenWatchlist}
            className="relative flex items-center gap-1.5 h-9 px-3 bg-white hover:bg-[#F0F3FA] text-[#131722] border border-[#E0E3EB] rounded-full text-xs font-medium transition-colors"
            title="Open Watchlist"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#2962FF]" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 bg-[#2962FF] text-white text-[10px] font-bold rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 h-9 px-2.5 rounded-full text-xs font-medium border transition-colors ${
              isLiveUpdating
                ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
                : 'bg-slate-100 text-[#787B86] border-[#E0E3EB] hover:bg-slate-200'
            }`}
            title={isLiveUpdating ? 'Live data streaming active (Click to pause)' : 'Data paused (Click to resume)'}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveUpdating ? 'bg-[#089981] animate-ping' : 'bg-slate-400'}`} />
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isLiveUpdating ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Nav Bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-[#E0E3EB] overflow-x-auto no-scrollbar bg-white">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#131722] text-white font-semibold'
                  : 'bg-[#F0F3FA] text-[#434656] hover:bg-[#E0E3EB]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
