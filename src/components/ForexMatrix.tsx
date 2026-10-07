import React from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './Sparkline';
import { Globe } from 'lucide-react';

interface ForexMatrixProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const ForexMatrix: React.FC<ForexMatrixProps> = ({ assets, onSelectAsset }) => {
  const forexAssets = assets.filter((a) => a.category === 'forex');

  // Forex cross matrix currencies
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
  const matrixData: { [key: string]: { [key: string]: number } } = {
    USD: { USD: 1.0, EUR: 0.954, GBP: 0.793, JPY: 154.62, CHF: 0.884, CAD: 1.402, AUD: 1.541 },
    EUR: { USD: 1.048, EUR: 1.0, GBP: 0.831, JPY: 162.08, CHF: 0.926, CAD: 1.469, AUD: 1.615 },
    GBP: { USD: 1.261, EUR: 1.203, GBP: 1.0, JPY: 195.05, CHF: 1.115, CAD: 1.768, AUD: 1.943 },
    JPY: { USD: 0.0065, EUR: 0.0062, GBP: 0.0051, JPY: 1.0, CHF: 0.0057, CAD: 0.0091, AUD: 0.0099 },
    CHF: { USD: 1.131, EUR: 1.079, GBP: 0.897, JPY: 174.91, CHF: 1.0, CAD: 1.586, AUD: 1.743 },
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forexAssets.map((asset) => {
          const isBull = asset.change >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className="bg-white p-4 rounded-xl border border-[#E0E3EB] hover:border-[#2962FF] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#003399] text-white text-[10px] font-bold flex items-center justify-center">
                    {asset.badgeText}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#131722]">{asset.symbol}</span>
                    <div className="text-[11px] text-[#787B86]">{asset.name}</div>
                  </div>
                </div>
                <div className="mt-2 text-base font-bold font-mono tabular-nums text-[#131722]">
                  {asset.price.toFixed(4)}
                </div>
                <div
                  className={`text-xs font-mono tabular-nums font-semibold ${
                    isBull ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isBull ? '+' : ''}
                  {asset.change.toFixed(4)} ({isBull ? '+' : ''}
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

      {/* FX Cross Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2962FF]" />
            <h3 className="text-base font-bold text-[#131722] font-display">
              Currency Cross Rates Matrix
            </h3>
          </div>
          <span className="text-xs text-[#787B86]">Mid-Market Institutional FX Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#FAF9FF] border-b border-[#E0E3EB] text-xs font-bold text-[#787B86]">
                <th className="py-2.5 px-3 text-left">Base / Term</th>
                {currencies.map((c) => (
                  <th key={c} className="py-2.5 px-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB] text-xs font-mono tabular-nums">
              {['USD', 'EUR', 'GBP', 'JPY', 'CHF'].map((base) => (
                <tr key={base} className="hover:bg-[#F8FAFD]">
                  <td className="py-2.5 px-3 text-left font-sans font-bold text-[#131722]">
                    {base}
                  </td>
                  {currencies.map((term) => {
                    const rate = matrixData[base]?.[term];
                    const isSelf = base === term;
                    return (
                      <td
                        key={term}
                        className={`py-2.5 px-3 ${
                          isSelf
                            ? 'bg-[#F0F3FA] text-[#787B86] font-normal'
                            : 'text-[#131722] font-medium hover:bg-[#2962FF]/10 hover:text-[#2962FF] cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isSelf) {
                            const found = assets.find((a) => a.symbol.includes(base) && a.symbol.includes(term));
                            if (found) onSelectAsset(found);
                          }
                        }}
                      >
                        {isSelf ? '1.0000' : rate ? (rate > 10 ? rate.toFixed(2) : rate.toFixed(4)) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
