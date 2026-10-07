export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high24h: number;
  low24h: number;
  volume: string;
  volumeRaw: number;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
  range52w: { low: number; high: number };
  technicalRating: TechnicalRating;
  technicalScore: number; // -100 to 100
  oscillators: {
    rsi: number;
    macd: string;
    stoch: number;
    rating: 'Buy' | 'Neutral' | 'Sell';
  };
  movingAverages: {
    ema20: number;
    sma50: number;
    sma200: number;
    rating: 'Buy' | 'Neutral' | 'Sell';
  };
  sparkline: number[];
  candles: Candle[];
  badgeBg: string;
  badgeText: string;
  currency: string;
}

export interface SectorItem {
  id: string;
  name: string;
  changePercent: number;
  marketCap: string;
  weight: number;
  topStock: string;
  color: string;
  constituents: { symbol: string; name: string; changePercent: number; weight: number }[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedTime: string;
  category: 'Stocks' | 'Crypto' | 'Macro' | 'Commodities' | 'Forex';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  readTime: string;
  relatedSymbols: string[];
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
}
