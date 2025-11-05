import React from 'react';

interface StockData {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePercent: number;
  data: number[]; // Array of data points for the graph
}

interface StockGraphProps {
  stock: StockData;
}

export const StockGraph: React.FC<StockGraphProps> = ({ stock }) => {
  const isPositive = stock.changePercent >= 0;
  const color = isPositive ? '#10b981' : '#ef4444'; // green or red

  // Normalize data for SVG path (0-100 range)
  const min = Math.min(...stock.data);
  const max = Math.max(...stock.data);
  const range = max - min || 1;
  
  const normalizedData = stock.data.map((value, index) => {
    const divisor = stock.data.length > 1 ? stock.data.length - 1 : 1;
    const x = (index / divisor) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y };
  });

  // Create SVG path
  const pathData = normalizedData
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const formatValue = (value: number, ticker: string) => {
    const formatted = value >= 1000 
      ? value.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    
    // Add dollar sign for Bitcoin and other USD pairs
    if (ticker.includes('BTCUSD') || ticker.includes('USD')) {
      return `$${formatted}`;
    }
    return formatted;
  };

  const formatChange = (change: number, ticker: string) => {
    // Add dollar sign for Bitcoin
    if (ticker.includes('BTCUSD')) {
      const sign = change >= 0 ? '+' : '';
      return `${sign}$${Math.abs(change).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    
    // For other stocks
    if (change >= 0) {
      return `+${change.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    return change.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
        <div className="text-xs text-gray-600 mb-1">{stock.ticker}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{formatChange(stock.change, stock.ticker)}</span>
        </div>
        <div className="text-sm font-semibold text-gray-900 mt-1">
          {formatValue(stock.value, stock.ticker)}
        </div>
      </div>
      <div className="w-20 h-12 flex-shrink-0">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={`gradient-${stock.ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`url(#gradient-${stock.ticker})`}
          />
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

