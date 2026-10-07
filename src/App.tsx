/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_MARKET_ASSETS } from './data/marketData';
import { MarketAsset, AssetCategory, PriceAlert } from './types/market';
import { Header } from './components/Header';
import { TickerRibbon } from './components/TickerRibbon';
import { IndexCards } from './components/IndexCards';
import { MarketsOverviewStats } from './components/MarketsOverviewStats';
import { MarketScreenerTable } from './components/MarketScreenerTable';
import { SectorHeatmap } from './components/SectorHeatmap';
import { NewsSection } from './components/NewsSection';
import { ForexMatrix } from './components/ForexMatrix';
import { BondsCurve } from './components/BondsCurve';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { OmniSearchModal } from './components/OmniSearchModal';
import { Bell, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);
  const [activeTab, setActiveTab] = useState<AssetCategory | 'overview'>('overview');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);

  // Recent tick tracking for flash highlights
  const [recentTickSymbol, setRecentTickSymbol] = useState<string | undefined>();
  const [recentTickDirection, setRecentTickDirection] = useState<'up' | 'down' | undefined>();

  // Watchlist persisted state
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mp_watchlist');
      return saved ? JSON.parse(saved) : ['SPX', 'NVDA', 'BTCUSD', 'AAPL'];
    } catch {
      return ['SPX', 'NVDA', 'BTCUSD', 'AAPL'];
    }
  });

  // Price Alerts persisted state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('mp_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeAlertNotification, setActiveAlertNotification] = useState<string | null>(null);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mp_watchlist', JSON.stringify(watchlistSymbols));
    } catch (e) {
      console.error(e);
    }
  }, [watchlistSymbols]);

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mp_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  // Global Keyboard Shortcut (⌘K or Ctrl+K) for Omni Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsWatchlistOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time market tick engine simulation
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        // Pick a random asset to tick
        const randomIndex = Math.floor(Math.random() * prevAssets.length);
        const target = prevAssets[randomIndex];

        // Subtle realistic price perturbation (-0.2% to +0.25%)
        const pctDelta = (Math.random() * 0.45 - 0.2) / 100;
        const priceDelta = target.price * pctDelta;
        const newPrice = Math.max(0.001, target.price + priceDelta);
        const newChange = target.change + priceDelta;
        const newChangePercent = (newChange / (target.prevClose || target.price)) * 100;

        const isUp = priceDelta >= 0;
        setRecentTickSymbol(target.symbol);
        setRecentTickDirection(isUp ? 'up' : 'down');

        // Check alerts for this symbol
        alerts.forEach((al) => {
          if (!al.triggered && al.symbol === target.symbol) {
            if (
              (al.condition === 'above' && newPrice >= al.targetPrice) ||
              (al.condition === 'below' && newPrice <= al.targetPrice)
            ) {
              setActiveAlertNotification(
                `Price Alert Triggered: ${target.symbol} has crossed $${al.targetPrice.toFixed(2)} (Current: $${newPrice.toFixed(2)})`
              );
              setAlerts((curr) =>
                curr.map((item) => (item.id === al.id ? { ...item, triggered: true } : item))
              );
            }
          }
        });

        // Update sparkline with new close
        const newSparkline = [...target.sparkline.slice(1), newPrice];

        // Update last candle close
        const newCandles = [...target.candles];
        if (newCandles.length > 0) {
          const lastCandle = { ...newCandles[newCandles.length - 1] };
          lastCandle.close = Number(newPrice.toFixed(2));
          lastCandle.high = Math.max(lastCandle.high, Number(newPrice.toFixed(2)));
          lastCandle.low = Math.min(lastCandle.low, Number(newPrice.toFixed(2)));
          newCandles[newCandles.length - 1] = lastCandle;
        }

        const updatedAsset: MarketAsset = {
          ...target,
          price: Number(newPrice.toFixed(target.category === 'forex' ? 4 : target.category === 'bonds' ? 3 : 2)),
          change: Number(newChange.toFixed(target.category === 'forex' ? 4 : target.category === 'bonds' ? 3 : 2)),
          changePercent: Number(newChangePercent.toFixed(2)),
          high24h: Math.max(target.high24h, newPrice),
          low24h: Math.min(target.low24h, newPrice),
          sparkline: newSparkline,
          candles: newCandles,
        };

        // If this asset is open in the modal, update selected asset state as well
        if (selectedAsset?.symbol === target.symbol) {
          setSelectedAsset(updatedAsset);
        }

        const updated = [...prevAssets];
        updated[randomIndex] = updatedAsset;
        return updated;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isLiveUpdating, alerts, selectedAsset]);

  // Clear tick highlight after 1.4s
  useEffect(() => {
    if (recentTickSymbol) {
      const timer = setTimeout(() => {
        setRecentTickSymbol(undefined);
        setRecentTickDirection(undefined);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [recentTickSymbol]);

  const handleToggleWatchlist = useCallback((symbol: string) => {
    setWatchlistSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  const handleSetAlert = useCallback((symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const handleRemoveAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const handleSelectSymbol = useCallback((symbol: string) => {
    const found = assets.find((a) => a.symbol === symbol);
    if (found) {
      setSelectedAsset(found);
    }
  }, [assets]);

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#131722] flex flex-col font-sans selection:bg-[#2962FF] selection:text-white">
      {/* 1. Header (Follows Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlistSymbols.length}
        isLiveUpdating={isLiveUpdating}
        onToggleLive={() => setIsLiveUpdating(!isLiveUpdating)}
      />

      {/* 2. Real-time Ticker Ribbon */}
      <TickerRibbon
        assets={assets}
        onSelectAsset={(a) => setSelectedAsset(a)}
        recentTickSymbol={recentTickSymbol}
        recentTickDirection={recentTickDirection}
      />

      {/* Alert Notification Toast */}
      {activeAlertNotification && (
        <div className="bg-[#2962FF] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-14 z-30 shadow-md">
          <div className="flex items-center gap-2 max-w-[1440px] mx-auto w-full">
            <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>{activeAlertNotification}</span>
            <button
              onClick={() => setActiveAlertNotification(null)}
              className="ml-auto underline text-[11px] hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Major Benchmark Cards Carousel */}
            <section>
              <IndexCards
                assets={assets}
                onSelectAsset={(a) => setSelectedAsset(a)}
                recentTickSymbol={recentTickSymbol}
              />
            </section>

            {/* Markets Cockpit Stats (Fear & Greed, Market Breadth, BTC Dominance, VIX) */}
            <section>
              <MarketsOverviewStats />
            </section>

            {/* Main Screener & Data Matrix */}
            <section>
              <MarketScreenerTable
                assets={assets}
                onSelectAsset={(a) => setSelectedAsset(a)}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={handleToggleWatchlist}
                recentTickSymbol={recentTickSymbol}
              />
            </section>

            {/* Sector Performance & Heatmap */}
            <section>
              <SectorHeatmap onSelectSymbol={handleSelectSymbol} />
            </section>

            {/* Curated Market News & Analysis */}
            <section>
              <NewsSection onSelectSymbol={handleSelectSymbol} />
            </section>
          </>
        )}

        {/* STOCKS TAB */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#131722] font-display">
                Stocks & Equities
              </h2>
              <p className="text-xs text-[#787B86] mt-0.5">
                Explore large-cap US equities, sector trends, valuation ratios, and technical ratings
              </p>
            </div>

            <SectorHeatmap onSelectSymbol={handleSelectSymbol} />

            <MarketScreenerTable
              assets={assets.filter((a) => a.category === 'stocks' || a.category === 'indices')}
              onSelectAsset={(a) => setSelectedAsset(a)}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentTickSymbol={recentTickSymbol}
            />

            <NewsSection onSelectSymbol={handleSelectSymbol} />
          </div>
        )}

        {/* CRYPTO TAB */}
        {activeTab === 'crypto' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#131722] font-display">
                  Cryptocurrency Markets
                </h2>
                <p className="text-xs text-[#787B86] mt-0.5">
                  Top digital assets, Layer 1 platforms, 24h volumes, and market dominance
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-white p-2.5 rounded-xl border border-[#E0E3EB]">
                <div>
                  <span className="text-[#787B86]">Global Crypto Cap:</span>{' '}
                  <strong className="font-mono text-[#131722]">$3.42T</strong>
                </div>
                <div className="h-4 w-px bg-[#E0E3EB]" />
                <div>
                  <span className="text-[#787B86]">24h Volume:</span>{' '}
                  <strong className="font-mono text-[#131722]">$148.5B</strong>
                </div>
              </div>
            </div>

            <MarketsOverviewStats />

            <MarketScreenerTable
              assets={assets.filter((a) => a.category === 'crypto')}
              onSelectAsset={(a) => setSelectedAsset(a)}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentTickSymbol={recentTickSymbol}
            />

            <NewsSection onSelectSymbol={handleSelectSymbol} />
          </div>
        )}

        {/* FOREX TAB */}
        {activeTab === 'forex' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#131722] font-display">
                Foreign Exchange (Forex)
              </h2>
              <p className="text-xs text-[#787B86] mt-0.5">
                Global currency pairs, cross rates matrix, institutional spreads, and central bank pricing
              </p>
            </div>

            <ForexMatrix
              assets={assets}
              onSelectAsset={(a) => setSelectedAsset(a)}
            />

            <MarketScreenerTable
              assets={assets.filter((a) => a.category === 'forex')}
              onSelectAsset={(a) => setSelectedAsset(a)}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentTickSymbol={recentTickSymbol}
            />

            <NewsSection onSelectSymbol={handleSelectSymbol} />
          </div>
        )}

        {/* COMMODITIES TAB */}
        {activeTab === 'commodities' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#131722] font-display">
                Commodities & Raw Materials
              </h2>
              <p className="text-xs text-[#787B86] mt-0.5">
                Precious metals, energy contracts, agricultural benchmarks, and global spot prices
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {assets
                .filter((a) => a.category === 'commodities')
                .map((comm) => (
                  <div
                    key={comm.symbol}
                    onClick={() => setSelectedAsset(comm)}
                    className="p-4 bg-white rounded-xl border border-[#E0E3EB] hover:border-[#2962FF] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: comm.badgeBg }}
                        >
                          {comm.badgeText}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#131722]">{comm.symbol}</div>
                          <div className="text-[11px] text-[#787B86]">{comm.name}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-lg font-mono font-bold text-[#131722]">
                        ${comm.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold ${
                          comm.change >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {comm.change >= 0 ? '+' : ''}
                        {comm.change.toFixed(2)} ({comm.change >= 0 ? '+' : ''}
                        {comm.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <MarketScreenerTable
              assets={assets.filter((a) => a.category === 'commodities')}
              onSelectAsset={(a) => setSelectedAsset(a)}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentTickSymbol={recentTickSymbol}
            />

            <NewsSection onSelectSymbol={handleSelectSymbol} />
          </div>
        )}

        {/* BONDS TAB */}
        {activeTab === 'bonds' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#131722] font-display">
                Government Bonds & Yield Curves
              </h2>
              <p className="text-xs text-[#787B86] mt-0.5">
                Sovereign benchmark debt yields, yield curve term structure, and monetary policy spreads
              </p>
            </div>

            <BondsCurve
              assets={assets}
              onSelectAsset={(a) => setSelectedAsset(a)}
            />

            <MarketScreenerTable
              assets={assets.filter((a) => a.category === 'bonds')}
              onSelectAsset={(a) => setSelectedAsset(a)}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentTickSymbol={recentTickSymbol}
            />

            <NewsSection onSelectSymbol={handleSelectSymbol} />
          </div>
        )}
      </main>

      {/* 4. Interactive Chart Modal */}
      {selectedAsset && (
        <InteractiveChartModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          isWatchlisted={watchlistSymbols.includes(selectedAsset.symbol)}
          onToggleWatchlist={() => handleToggleWatchlist(selectedAsset.symbol)}
          onSetAlert={handleSetAlert}
        />
      )}

      {/* 5. Watchlist Slide-Over Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlistSymbols}
        assets={assets}
        onRemoveWatchlist={handleToggleWatchlist}
        onSelectAsset={(a) => setSelectedAsset(a)}
        alerts={alerts}
        onRemoveAlert={handleRemoveAlert}
      />

      {/* 6. Omni Search Modal (Ctrl+K) */}
      <OmniSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        onSelectAsset={(a) => setSelectedAsset(a)}
      />

      {/* 7. Footer */}
      <footer className="mt-16 border-t border-[#E0E3EB] bg-white py-8 text-xs text-[#787B86]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#131722] text-white flex items-center justify-center font-black text-[10px]">
              //
            </div>
            <span className="font-extrabold text-[#131722] font-display">Market Precision</span>
            <span>· Financial Intelligence & Market Screening</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Real-time feeds simulated from BZX, NASDAQ & CME</span>
            <span>·</span>
            <span>All times EST</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
