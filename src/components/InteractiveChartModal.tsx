import React, { useState, useRef, useMemo } from 'react';
import { MarketAsset, Candle } from '../types/market';
import {
  X,
  TrendingUp,
  TrendingDown,
  Bookmark,
  BookmarkCheck,
  Bell,
  CheckCircle2,
  BarChart2,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface InteractiveChartModalProps {
  asset: MarketAsset;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onSetAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
}

type ChartType = 'candles' | 'line' | 'area';

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onSetAlert,
}) => {
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoveredCandleIndex, setHoveredCandleIndex] = useState<number | null>(null);
  const [alertPriceInput, setAlertPriceInput] = useState(asset.price.toString());
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [tradeActionMessage, setTradeActionMessage] = useState<string | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState('10');

  const candles = asset.candles;
  const isBullish = asset.change >= 0;

  // Chart Geometry
  const width = 840;
  const mainHeight = 320;
  const rsiHeight = showRSI ? 90 : 0;
  const totalSvgHeight = mainHeight + rsiHeight + 35;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate Price Range
  const prices = useMemo(() => {
    const list: number[] = [];
    candles.forEach((c) => {
      list.push(c.high, c.low);
    });
    return list;
  }, [candles]);

  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  // Calculate Moving Averages
  const ma20 = useMemo(() => {
    return candles.map((_, i) => {
      if (i < 4) return null;
      const windowSlice = candles.slice(Math.max(0, i - 19), i + 1);
      const avg = windowSlice.reduce((sum, c) => sum + c.close, 0) / windowSlice.length;
      return avg;
    });
  }, [candles]);

  const ma50 = useMemo(() => {
    return candles.map((_, i) => {
      if (i < 8) return null;
      const windowSlice = candles.slice(Math.max(0, i - 29), i + 1);
      const avg = windowSlice.reduce((sum, c) => sum + c.close, 0) / windowSlice.length;
      return avg;
    });
  }, [candles]);

  // Coordinates helper
  const getX = (index: number) => {
    return paddingX + (index / (candles.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    return (
      mainHeight -
      paddingY -
      ((val - minPrice) / priceRange) * (mainHeight - paddingY * 2)
    );
  };

  // Max volume for volume bars
  const maxVol = Math.max(...candles.map((c) => c.volume));

  // Current inspected candle
  const activeCandle: Candle =
    hoveredCandleIndex !== null && candles[hoveredCandleIndex]
      ? candles[hoveredCandleIndex]
      : candles[candles.length - 1];

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(alertPriceInput);
    if (!isNaN(target) && target > 0) {
      const condition = target > asset.price ? 'above' : 'below';
      onSetAlert(asset.symbol, target, condition);
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 3000);
    }
  };

  const handleSimulateTrade = (side: 'Buy' | 'Sell') => {
    const qty = parseInt(tradeQuantity) || 1;
    const total = (qty * asset.price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setTradeActionMessage(`Simulated ${side.toUpperCase()} order executed: ${qty} ${asset.symbol} @ $${asset.price.toFixed(2)} (Total: $${total})`);
    setTimeout(() => setTradeActionMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#E0E3EB] bg-[#FAF9FF] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: asset.badgeBg }}
            >
              {asset.badgeText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#131722] font-display">
                  {asset.symbol}
                </h2>
                <span className="text-xs text-[#787B86] font-medium hidden sm:inline">
                  {asset.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F3FA] text-[#434656] font-mono">
                  {asset.exchange}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="font-mono font-bold text-base text-[#131722]">
                  {asset.category === 'bonds'
                    ? `${asset.price.toFixed(3)}%`
                    : asset.category === 'forex'
                    ? asset.price.toFixed(4)
                    : `$${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
                <span
                  className={`font-mono font-semibold flex items-center ${
                    isBullish ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isBullish ? '+' : ''}
                  {asset.change.toFixed(2)} ({isBullish ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleWatchlist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isWatchlisted
                  ? 'bg-[#2962FF] text-white border-[#2962FF]'
                  : 'bg-white text-[#131722] border-[#E0E3EB] hover:bg-[#F0F3FA]'
              }`}
            >
              {isWatchlisted ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isWatchlisted ? 'Watchlisted' : 'Watchlist'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#787B86] hover:text-[#131722] hover:bg-[#E0E3EB] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & HUD */}
        <div className="px-5 py-2.5 border-b border-[#E0E3EB] bg-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Chart Types & Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] rounded-md border border-[#E0E3EB]">
              <button
                onClick={() => setChartType('candles')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  chartType === 'candles' ? 'bg-white text-[#131722] shadow-xs' : 'text-[#787B86]'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  chartType === 'line' ? 'bg-white text-[#131722] shadow-xs' : 'text-[#787B86]'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  chartType === 'area' ? 'bg-white text-[#131722] shadow-xs' : 'text-[#787B86]'
                }`}
              >
                Area
              </button>
            </div>

            <div className="h-4 w-px bg-[#E0E3EB] hidden sm:block" />

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMA20(!showMA20)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  showMA20
                    ? 'bg-[#2962FF]/10 text-[#2962FF] border-[#2962FF]/30'
                    : 'text-[#787B86] border-transparent hover:bg-[#F0F3FA]'
                }`}
              >
                EMA 20
              </button>
              <button
                onClick={() => setShowMA50(!showMA50)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  showMA50
                    ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30'
                    : 'text-[#787B86] border-transparent hover:bg-[#F0F3FA]'
                }`}
              >
                SMA 50
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  showVolume
                    ? 'bg-[#131722]/10 text-[#131722] border-[#131722]/30'
                    : 'text-[#787B86] border-transparent hover:bg-[#F0F3FA]'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  showRSI
                    ? 'bg-[#9C27B0]/10 text-[#9C27B0] border-[#9C27B0]/30'
                    : 'text-[#787B86] border-transparent hover:bg-[#F0F3FA]'
                }`}
              >
                RSI (14)
              </button>
            </div>
          </div>

          {/* Dynamic Inspection HUD */}
          <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-[#787B86] bg-[#FAF9FF] px-2.5 py-1 rounded border border-[#E0E3EB]">
            <span>Date: <strong className="text-[#131722]">{activeCandle.time}</strong></span>
            <span>O: <strong className="text-[#131722]">{activeCandle.open}</strong></span>
            <span>H: <strong className="text-[#089981]">{activeCandle.high}</strong></span>
            <span>L: <strong className="text-[#F23645]">{activeCandle.low}</strong></span>
            <span>C: <strong className="text-[#131722]">{activeCandle.close}</strong></span>
          </div>
        </div>

        {/* Trade Action Feedback Banner if triggered */}
        {tradeActionMessage && (
          <div className="px-5 py-2 bg-[#089981]/15 text-[#089981] border-b border-[#089981]/20 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{tradeActionMessage}</span>
          </div>
        )}

        {/* Modal Main Body (Chart + Technical Analysis Column) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E0E3EB]">
          {/* Main Chart Canvas (3 cols) */}
          <div className="lg:col-span-3 p-4 select-none relative flex flex-col justify-between">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${totalSvgHeight}`}
                className="w-full h-auto cursor-crosshair"
                onMouseLeave={() => setHoveredCandleIndex(null)}
              >
                {/* Horizontal price grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                  const yVal = paddingY + ratio * (mainHeight - paddingY * 2);
                  const priceAtY = maxPrice - ratio * priceRange;
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={yVal}
                        x2={width - paddingX}
                        y2={yVal}
                        stroke="#E0E3EB"
                        strokeDasharray="2 4"
                      />
                      <text
                        x={width - paddingX + 6}
                        y={yVal + 3}
                        fontSize={9}
                        fill="#787B86"
                        fontFamily="JetBrains Mono"
                      >
                        {priceAtY.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Volume Histogram at bottom of main chart */}
                {showVolume &&
                  candles.map((c, i) => {
                    const x = getX(i);
                    const volHeight = (c.volume / (maxVol || 1)) * 50;
                    const y = mainHeight - paddingY - volHeight;
                    const isGreen = c.close >= c.open;
                    return (
                      <rect
                        key={`vol-${i}`}
                        x={x - 4}
                        y={y}
                        width={8}
                        height={volHeight}
                        fill={isGreen ? '#089981' : '#F23645'}
                        opacity={0.2}
                      />
                    );
                  })}

                {/* Candles or Line or Area */}
                {chartType === 'candles' &&
                  candles.map((c, i) => {
                    const x = getX(i);
                    const highY = getY(c.high);
                    const lowY = getY(c.low);
                    const openY = getY(c.open);
                    const closeY = getY(c.close);
                    const isGreen = c.close >= c.open;
                    const candleColor = isGreen ? '#089981' : '#F23645';
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g key={i}>
                        {/* Wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth={1.5}
                        />
                        {/* Body */}
                        <rect
                          x={x - 4}
                          y={bodyTop}
                          width={8}
                          height={bodyHeight}
                          fill={candleColor}
                          rx={1}
                        />
                      </g>
                    );
                  })}

                {chartType === 'line' && (
                  <path
                    d={`M ${candles.map((c, i) => `${getX(i).toFixed(1)},${getY(c.close).toFixed(1)}`).join(' L ')}`}
                    fill="none"
                    stroke="#2962FF"
                    strokeWidth={2.5}
                  />
                )}

                {chartType === 'area' && (
                  <>
                    <defs>
                      <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2962FF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2962FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${candles.map((c, i) => `${getX(i).toFixed(1)},${getY(c.close).toFixed(1)}`).join(' L ')} L ${getX(candles.length - 1)},${mainHeight - paddingY} L ${getX(0)},${mainHeight - paddingY} Z`}
                      fill="url(#area-grad)"
                    />
                    <path
                      d={`M ${candles.map((c, i) => `${getX(i).toFixed(1)},${getY(c.close).toFixed(1)}`).join(' L ')}`}
                      fill="none"
                      stroke="#2962FF"
                      strokeWidth={2}
                    />
                  </>
                )}

                {/* MA 20 Line (Blue) */}
                {showMA20 && (
                  <path
                    d={`M ${ma20
                      .map((val, i) => (val ? `${getX(i).toFixed(1)},${getY(val).toFixed(1)}` : ''))
                      .filter(Boolean)
                      .join(' L ')}`}
                    fill="none"
                    stroke="#2962FF"
                    strokeWidth={1.8}
                  />
                )}

                {/* MA 50 Line (Orange) */}
                {showMA50 && (
                  <path
                    d={`M ${ma50
                      .map((val, i) => (val ? `${getX(i).toFixed(1)},${getY(val).toFixed(1)}` : ''))
                      .filter(Boolean)
                      .join(' L ')}`}
                    fill="none"
                    stroke="#FF9900"
                    strokeWidth={1.8}
                  />
                )}

                {/* Sub-panel: RSI (14) indicator */}
                {showRSI && (
                  <g transform={`translate(0, ${mainHeight + 15})`}>
                    <line x1={paddingX} y1={0} x2={width - paddingX} y2={0} stroke="#E0E3EB" />
                    {/* RSI 70 Overbought */}
                    <line
                      x1={paddingX}
                      y1={rsiHeight * 0.3}
                      x2={width - paddingX}
                      y2={rsiHeight * 0.3}
                      stroke="#F23645"
                      strokeDasharray="2 4"
                      opacity={0.5}
                    />
                    {/* RSI 30 Oversold */}
                    <line
                      x1={paddingX}
                      y1={rsiHeight * 0.7}
                      x2={width - paddingX}
                      y2={rsiHeight * 0.7}
                      stroke="#089981"
                      strokeDasharray="2 4"
                      opacity={0.5}
                    />
                    <text x={paddingX} y={12} fontSize={9} fill="#9C27B0" fontWeight="bold">
                      RSI (14): {asset.oscillators.rsi.toFixed(1)}
                    </text>
                    <path
                      d={`M ${candles
                        .map((_, i) => {
                          const rx = getX(i);
                          const rsiVal = 30 + (Math.sin(i * 0.3) * 20 + 20);
                          const ry = rsiHeight - (rsiVal / 100) * rsiHeight;
                          return `${rx.toFixed(1)},${ry.toFixed(1)}`;
                        })
                        .join(' L ')}`}
                      fill="none"
                      stroke="#9C27B0"
                      strokeWidth={1.5}
                    />
                  </g>
                )}

                {/* Interactive Crosshair & Hover Overlay */}
                {candles.map((_, i) => {
                  const x = getX(i);
                  return (
                    <rect
                      key={`hit-${i}`}
                      x={x - (width / candles.length) / 2}
                      y={0}
                      width={width / candles.length}
                      height={totalSvgHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredCandleIndex(i)}
                    />
                  );
                })}

                {hoveredCandleIndex !== null && (
                  <g pointerEvents="none">
                    <line
                      x1={getX(hoveredCandleIndex)}
                      y1={paddingY}
                      x2={getX(hoveredCandleIndex)}
                      y2={totalSvgHeight - 20}
                      stroke="#787B86"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={paddingX}
                      y1={getY(candles[hoveredCandleIndex].close)}
                      x2={width - paddingX}
                      y2={getY(candles[hoveredCandleIndex].close)}
                      stroke="#787B86"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Quick TradingView Paper Trade Simulator Bar */}
            <div className="mt-4 p-3 bg-[#FAF9FF] border border-[#E0E3EB] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#131722]">Paper Trade:</span>
                <input
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className="w-16 h-8 px-2 text-xs font-mono font-bold bg-white border border-[#E0E3EB] rounded text-center"
                />
                <span className="text-xs text-[#787B86]">Shares / Units</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateTrade('Buy')}
                  className="flex items-center gap-1 px-4 py-1.5 bg-[#089981] hover:bg-[#07856e] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  BUY @ ${asset.price.toFixed(2)}
                </button>
                <button
                  onClick={() => handleSimulateTrade('Sell')}
                  className="flex items-center gap-1 px-4 py-1.5 bg-[#F23645] hover:bg-[#d42d3b] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  SELL @ ${asset.price.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Technical Gauges, Stats & Price Alerts (1 col) */}
          <div className="p-4 sm:p-5 space-y-5 bg-[#FAF9FF]/40">
            {/* Technical Analysis Speedometer / Gauge */}
            <div className="bg-white p-4 rounded-xl border border-[#E0E3EB]">
              <div className="text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
                Technical Summary
              </div>
              <div className="text-center py-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-extrabold text-white bg-[#089981]">
                  {asset.technicalRating}
                </div>
                <div className="text-[11px] text-[#787B86] mt-1">
                  Overall Score: <strong className="text-[#131722]">{asset.technicalScore}/100</strong>
                </div>
              </div>

              {/* Technical breakdown pills */}
              <div className="mt-3 space-y-2 text-xs border-t border-[#F0F3FA] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#787B86]">Oscillators</span>
                  <span className="font-bold text-[#089981]">{asset.oscillators.rating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#787B86]">Moving Averages</span>
                  <span className="font-bold text-[#089981]">{asset.movingAverages.rating}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#787B86]">RSI (14)</span>
                  <span className="font-mono text-[#131722]">{asset.oscillators.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#787B86]">MACD</span>
                  <span className="font-mono text-[#131722]">{asset.oscillators.macd}</span>
                </div>
              </div>
            </div>

            {/* Key Statistics Table */}
            <div className="bg-white p-4 rounded-xl border border-[#E0E3EB] space-y-2.5 text-xs">
              <div className="text-xs font-bold text-[#131722] uppercase tracking-wider mb-2">
                Key Metrics
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Open</span>
                <span className="font-mono font-semibold text-[#131722]">${asset.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Day High</span>
                <span className="font-mono font-semibold text-[#089981]">${asset.high24h.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Day Low</span>
                <span className="font-mono font-semibold text-[#F23645]">${asset.low24h.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787B86]">Volume</span>
                <span className="font-mono font-semibold text-[#131722]">{asset.volume}</span>
              </div>
              {asset.marketCap && (
                <div className="flex justify-between">
                  <span className="text-[#787B86]">Market Cap</span>
                  <span className="font-mono font-semibold text-[#131722]">{asset.marketCap}</span>
                </div>
              )}
              {asset.peRatio && (
                <div className="flex justify-between">
                  <span className="text-[#787B86]">P/E Ratio</span>
                  <span className="font-mono font-semibold text-[#131722]">{asset.peRatio}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#F0F3FA]">
                <div className="flex justify-between text-[11px] text-[#787B86] mb-1">
                  <span>52W Low: ${asset.range52w.low}</span>
                  <span>52W High: ${asset.range52w.high}</span>
                </div>
              </div>
            </div>

            {/* Set Price Alert Form */}
            <form onSubmit={handleCreateAlert} className="bg-white p-4 rounded-xl border border-[#E0E3EB] space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#131722]">
                <Bell className="w-3.5 h-3.5 text-[#2962FF]" />
                <span>Create Price Alert</span>
              </div>
              <p className="text-[11px] text-[#787B86]">
                Receive instant alert when {asset.symbol} reaches target.
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={alertPriceInput}
                  onChange={(e) => setAlertPriceInput(e.target.value)}
                  className="flex-1 h-8 px-2.5 bg-[#F0F3FA] text-xs font-mono font-bold rounded border border-transparent focus:border-[#2962FF] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 h-8 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-bold rounded transition-colors"
                >
                  Set
                </button>
              </div>
              {alertSuccess && (
                <div className="text-[11px] text-[#089981] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Alert registered successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
