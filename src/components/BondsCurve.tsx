import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown, Landmark } from 'lucide-react';

interface BondsCurveProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const BondsCurve: React.FC<BondsCurveProps> = ({ assets, onSelectAsset }) => {
  const bondAssets = assets.filter((a) => a.category === 'bonds');

  // US Treasury Yield Curve points
  const maturities = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];
  const currentYields = [4.58, 4.54, 4.49, 4.38, 4.25, 4.28, 4.32, 4.38, 4.41, 4.68, 4.62];
  const lastMonthYields = [4.82, 4.79, 4.72, 4.58, 4.41, 4.42, 4.44, 4.48, 4.52, 4.78, 4.71];

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG Chart Dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const minYield = 4.0;
  const maxYield = 5.0;

  const getCoordinates = (yields: number[]) => {
    return yields.map((y, idx) => {
      const x = paddingX + (idx / (maturities.length - 1)) * (svgWidth - paddingX * 2);
      const yPos =
        svgHeight - paddingY - ((y - minYield) / (maxYield - minYield)) * (svgHeight - paddingY * 2);
      return { x, y: yPos, val: y, term: maturities[idx] };
    });
  };

  const currentCoords = getCoordinates(currentYields);
  const lastMonthCoords = getCoordinates(lastMonthYields);

  const makePath = (coords: { x: number; y: number }[]) => {
    return `M ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bondAssets.map((asset) => {
          const isBull = asset.change >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className="bg-white p-4 rounded-xl border border-[#E0E3EB] hover:border-[#2962FF] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#089981] text-white text-[10px] font-bold flex items-center justify-center">
                    {asset.badgeText}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#131722]">{asset.symbol}</span>
                    <div className="text-[11px] text-[#787B86]">{asset.name}</div>
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold font-mono tabular-nums text-[#131722]">
                  {asset.price.toFixed(3)}%
                </div>
                <div
                  className={`text-xs font-mono tabular-nums font-semibold ${
                    isBull ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isBull ? '+' : ''}
                  {asset.change.toFixed(3)}% ({isBull ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="w-20">
                <Sparkline data={asset.sparkline} width={80} height={32} isPositive={isBull} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Yield Curve Visualizer */}
      <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#2962FF]" />
              <h3 className="text-base font-bold text-[#131722] font-display">
                US Treasury Yield Curve Structure
              </h3>
            </div>
            <p className="text-xs text-[#787B86] mt-0.5">
              10Y - 2Y Spread: <span className="font-bold text-[#089981]">+16.4 bps</span> (Dis-inverted / Steepening)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#2962FF] rounded" />
              <span className="text-[#131722]">Current Curve</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-300 rounded border-dashed" />
              <span className="text-[#787B86]">1 Month Ago</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Curve */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Horizontal Grid lines */}
              {[4.0, 4.25, 4.5, 4.75, 5.0].map((level) => {
                const yPos =
                  svgHeight -
                  paddingY -
                  ((level - minYield) / (maxYield - minYield)) * (svgHeight - paddingY * 2);
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={yPos}
                      x2={svgWidth - paddingX}
                      y2={yPos}
                      stroke="#E0E3EB"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill="#787B86"
                      fontFamily="JetBrains Mono"
                    >
                      {level.toFixed(2)}%
                    </text>
                  </g>
                );
              })}

              {/* Curve 1: 1 Month Ago */}
              <path
                d={makePath(lastMonthCoords)}
                fill="none"
                stroke="#C3C5D8"
                strokeWidth={2}
                strokeDasharray="4 4"
              />

              {/* Curve 2: Current */}
              <path
                d={makePath(currentCoords)}
                fill="none"
                stroke="#2962FF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points on Current Curve */}
              {currentCoords.map((pt, i) => {
                const isHovered = hoveredPoint === i;
                return (
                  <g
                    key={pt.term}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#2962FF"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      className="transition-all"
                    />
                    {/* Maturity Label */}
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize={11}
                      fill={isHovered ? '#131722' : '#787B86'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontFamily="Inter"
                    >
                      {pt.term}
                    </text>

                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 36}
                          y={pt.y - 32}
                          width={72}
                          height={22}
                          rx={4}
                          fill="#131722"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 18}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize={10}
                          fontWeight="bold"
                          fontFamily="JetBrains Mono"
                        >
                          {pt.val.toFixed(2)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
