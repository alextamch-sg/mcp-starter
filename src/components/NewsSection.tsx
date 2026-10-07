import React, { useState } from 'react';
import { NEWS_DATA } from '../data/newsData';
import { NewsItem } from '../types/market';
import { Newspaper, Clock, ExternalLink, X, ArrowUpRight } from 'lucide-react';

interface NewsSectionProps {
  onSelectSymbol: (symbol: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onSelectSymbol }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const categories = ['All', 'Stocks', 'Crypto', 'Macro', 'Commodities'];

  const filteredNews =
    selectedCategory === 'All'
      ? NEWS_DATA
      : NEWS_DATA.filter((n) => n.category === selectedCategory);

  return (
    <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#2962FF]" />
            <h3 className="text-lg font-bold text-[#131722] font-display">
              Market News & Top Stories
            </h3>
          </div>
          <p className="text-xs text-[#787B86] mt-0.5">
            Real-time market intelligence curated from top global financial wires
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F0F3FA] rounded-lg border border-[#E0E3EB] self-start sm:self-auto overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-[#131722] shadow-xs'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="divide-y divide-[#E0E3EB]">
        {filteredNews.map((news) => (
          <div
            key={news.id}
            onClick={() => setActiveArticle(news)}
            className="py-3.5 first:pt-0 last:pb-0 group cursor-pointer hover:bg-[#FAF9FF] -mx-4 px-4 sm:-mx-5 sm:px-5 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-[#787B86]">
                  <span className="font-semibold text-[#131722]">{news.source}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {news.publishedTime}
                  </span>
                  <span>·</span>
                  <span>{news.readTime}</span>
                  <span
                    className={`ml-1 font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                      news.sentiment === 'Bullish'
                        ? 'bg-[#089981]/15 text-[#089981]'
                        : news.sentiment === 'Bearish'
                        ? 'bg-[#F23645]/15 text-[#F23645]'
                        : 'bg-slate-100 text-[#787B86]'
                    }`}
                  >
                    {news.sentiment}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#131722] group-hover:text-[#2962FF] transition-colors leading-snug">
                  {news.title}
                </h4>

                <p className="text-xs text-[#434656] line-clamp-2 leading-relaxed">
                  {news.summary}
                </p>

                {/* Related Ticker Badges */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#787B86]">Related:</span>
                  {news.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSymbol(sym);
                      }}
                      className="px-1.5 py-0.5 bg-[#F0F3FA] hover:bg-[#2962FF] hover:text-white rounded text-[11px] font-mono font-bold text-[#131722] transition-colors"
                    >
                      ${sym}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-[#2962FF]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-[#E0E3EB] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#787B86]">
                  <span className="font-bold text-[#131722]">{activeArticle.source}</span>
                  <span>·</span>
                  <span>{activeArticle.publishedTime}</span>
                  <span>·</span>
                  <span>{activeArticle.category}</span>
                </div>
                <h3 className="text-xl font-bold text-[#131722] font-display">
                  {activeArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-full text-[#787B86] hover:text-[#131722] hover:bg-[#F0F3FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F0F3FA] rounded-xl text-xs font-medium text-[#131722] border-l-4 border-[#2962FF]">
              {activeArticle.summary}
            </div>

            <div className="text-sm text-[#434656] leading-relaxed space-y-3">
              <p>{activeArticle.content}</p>
              <p>
                Market participants continue to scrutinize implied volatility surfaces and open
                interest distribution for confirmation of underlying positioning trends.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E0E3EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#787B86]">Mentioned Assets:</span>
                {activeArticle.relatedSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      setActiveArticle(null);
                      onSelectSymbol(sym);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-[#F0F3FA] hover:bg-[#2962FF] hover:text-white rounded text-xs font-mono font-bold transition-colors"
                  >
                    <span>{sym}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-1.5 bg-[#131722] text-white text-xs font-bold rounded-lg hover:bg-slate-800"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
