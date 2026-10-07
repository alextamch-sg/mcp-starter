import React, { useState } from 'react';
import { SECTORS_DATA } from '../data/sectorsData';
import { SectorItem, MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown, Layers, Grid } from 'lucide-react';

interface SectorHeatmapProps {
  onSelectSymbol: (symbol: string) => void;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ onSelectSymbol }) => {
  const [selectedSector, setSelectedSector] = useState<SectorItem | null>(null);
  const [viewMode, setViewMode] = useState<'treemap' | 'grid'>('treemap');

  // Helper for heatmap colors
  const getTileBg = (chg: number) => {
    if (chg >= 2.0) return 'bg-[#089981] text-white';
    if (chg >= 1.0) return 'bg-[#089981]/85 text-white';
    if (chg >= 0.3) return 'bg-[#089981]/60 text-slate-900';
    if (chg >= 0) return 'bg-[#089981]/30 text-slate-900';
    if (chg >= -0.5) return 'bg-[#F23645]/30 text-slate-900';
    if (chg >= -1.0) return 'bg-[#F23645]/60 text-white';
    return 'bg-[#F23645] text-white';
  };

  return (
    <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#131722] font-display">
              S&P 500 Sector Heatmap
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0F3FA] text-[#434656]">
              11 Sectors
            </span>
          </div>
          <p className="text-xs text-[#787B86] mt-0.5">
            Capitalization-weighted sector performance and market momentum
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] rounded-lg border border-[#E0E3EB] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('treemap')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              viewMode === 'treemap' ? 'bg-white text-[#131722] shadow-xs' : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              viewMode === 'grid' ? 'bg-white text-[#131722] shadow-xs' : 'text-[#787B86] hover:text-[#131722]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Detailed Grid</span>
          </button>
        </div>
      </div>

      {/* Heatmap Layout */}
      {viewMode === 'treemap' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {SECTORS_DATA.map((sector) => {
            const isBullish = sector.changePercent >= 0;
            const isSelected = selectedSector?.id === sector.id;

            return (
              <div
                key={sector.id}
                onClick={() => setSelectedSector(isSelected ? null : sector)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:ring-2 hover:ring-[#2962FF] hover:scale-[1.01] flex flex-col justify-between min-h-[96px] ${getTileBg(
                  sector.changePercent
                )} ${isSelected ? 'ring-2 ring-[#2962FF] shadow-md' : ''}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs leading-tight line-clamp-1">
                      {sector.name}
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0 font-mono">
                      {sector.weight}%
                    </span>
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5 truncate">
                    Top: {sector.topStock}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-bold font-mono tabular-nums flex items-center">
                    {isBullish ? '+' : ''}
                    {sector.changePercent.toFixed(2)}%
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">
                    {sector.marketCap}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTORS_DATA.map((sector) => {
            const isBullish = sector.changePercent >= 0;
            return (
              <div
                key={sector.id}
                onClick={() => setSelectedSector(selectedSector?.id === sector.id ? null : sector)}
                className="p-3 bg-[#FAF9FF] border border-[#E0E3EB] rounded-lg hover:border-[#2962FF] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#131722]">{sector.name}</div>
                  <div
                    className={`font-mono font-bold text-xs flex items-center ${
                      isBullish ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isBullish ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    {isBullish ? '+' : ''}
                    {sector.changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#787B86] mt-2">
                  <span>Weight: {sector.weight}% · Cap: {sector.marketCap}</span>
                  <span className="text-[#131722] font-medium">{sector.topStock}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drill-down Drawer for Selected Sector */}
      {selectedSector && (
        <div className="p-4 bg-[#F0F3FA] rounded-xl border border-[#E0E3EB] animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-[#131722]">
                {selectedSector.name} — Major Constituents
              </h4>
              <p className="text-xs text-[#787B86]">
                Click any asset to launch full technical analysis
              </p>
            </div>
            <button
              onClick={() => setSelectedSector(null)}
              className="text-xs text-[#787B86] hover:text-[#131722] font-semibold px-2 py-1 rounded hover:bg-[#E0E3EB]"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedSector.constituents.map((stock) => {
              const isBull = stock.changePercent >= 0;
              return (
                <button
                  key={stock.symbol}
                  onClick={() => onSelectSymbol(stock.symbol)}
                  className="p-2.5 bg-white rounded-lg border border-[#E0E3EB] hover:border-[#2962FF] hover:shadow-xs transition-all text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-[#131722]">{stock.symbol}</div>
                    <div className="text-[10px] text-[#787B86] truncate max-w-[90px]">
                      {stock.name}
                    </div>
                  </div>
                  <div
                    className={`font-mono text-xs font-bold ${
                      isBull ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isBull ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
