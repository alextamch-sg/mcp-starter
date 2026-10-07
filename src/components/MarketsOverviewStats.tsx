import React from 'react';
import { Gauge, TrendingUp, TrendingDown, ShieldAlert, Zap } from 'lucide-react';

export const MarketsOverviewStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Fear & Greed Index */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E3EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#787B86]">
          <span className="font-semibold text-[#131722] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#089981]" />
            Fear & Greed Index
          </span>
          <span>Crypto / Equities</span>
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#089981]">68</span>
          <span className="text-xs font-bold text-[#089981] px-2 py-0.5 rounded-full bg-[#089981]/15">
            Greed
          </span>
        </div>
        <div>
          <div className="w-full bg-[#E0E3EB] h-2 rounded-full overflow-hidden flex">
            <div className="bg-[#F23645] w-1/4 h-full" title="Extreme Fear (0-25)" />
            <div className="bg-amber-400 w-1/4 h-full" title="Fear (25-50)" />
            <div className="bg-emerald-400 w-1/4 h-full" title="Greed (50-75)" />
            <div className="bg-[#089981] w-1/4 h-full" title="Extreme Greed (75-100)" />
          </div>
          <div className="flex justify-between text-[10px] text-[#787B86] mt-1 font-mono">
            <span>0 Extreme Fear</span>
            <span>100 Extreme Greed</span>
          </div>
        </div>
      </div>

      {/* 2. Market Breadth: Advancers vs Decliners */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E3EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#787B86]">
          <span className="font-semibold text-[#131722] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#2962FF]" />
            S&P 500 Market Breadth
          </span>
          <span>NYSE + NASDAQ</span>
        </div>
        <div className="my-2 flex items-center justify-between text-xs">
          <div>
            <div className="text-base font-bold font-mono text-[#089981]">328 Advancing</div>
            <div className="text-[11px] text-[#787B86]">65.6% of issues</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold font-mono text-[#F23645]">172 Declining</div>
            <div className="text-[11px] text-[#787B86]">34.4% of issues</div>
          </div>
        </div>
        <div>
          <div className="w-full bg-[#F23645] h-2 rounded-full overflow-hidden flex">
            <div className="bg-[#089981] h-full" style={{ width: '65.6%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#787B86] mt-1">
            <span>Bullish Momentum</span>
            <span>A/D Ratio: 1.91</span>
          </div>
        </div>
      </div>

      {/* 3. Bitcoin Dominance */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E3EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#787B86]">
          <span className="font-semibold text-[#131722] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F7931A]" />
            Bitcoin Dominance
          </span>
          <span>Global Crypto MktCap</span>
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#131722]">58.4%</span>
          <span className="text-xs font-bold text-[#089981]">+0.42% 24h</span>
        </div>
        <div>
          <div className="w-full bg-[#627EEA] h-2 rounded-full overflow-hidden flex">
            <div className="bg-[#F7931A] h-full" style={{ width: '58.4%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#787B86] mt-1 font-mono">
            <span>BTC 58.4%</span>
            <span>Altcoins 41.6%</span>
          </div>
        </div>
      </div>

      {/* 4. Cboe Volatility VIX */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E3EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#787B86]">
          <span className="font-semibold text-[#131722] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#2962FF]" />
            Volatility Index (VIX)
          </span>
          <span>Implied 30D Vol</span>
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[#131722]">14.18</span>
          <span className="text-xs font-bold text-[#089981] px-2 py-0.5 rounded-full bg-[#089981]/15">
            -0.62 (-4.19%)
          </span>
        </div>
        <div className="text-[11px] text-[#787B86] flex items-center justify-between border-t border-[#F0F3FA] pt-1 mt-1">
          <span>Regime: Low Volatility</span>
          <span className="font-semibold text-[#089981]">Calm Conditions</span>
        </div>
      </div>
    </div>
  );
};
