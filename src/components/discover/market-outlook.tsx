import React from 'react';
import { StockGraph } from './stock-graph';

interface StockData {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePercent: number;
  data: number[];
}

// Generate mock data points for the graph
const generateMockData = (baseValue: number, trend: 'up' | 'down', volatility: number = 0.02): number[] => {
  const points = 20;
  const data: number[] = [];
  let current = baseValue;
  
  for (let i = 0; i < points; i++) {
    const direction = trend === 'up' ? 1 : -1;
    const randomChange = (Math.random() - 0.5) * volatility * baseValue;
    current += direction * (baseValue * 0.001) + randomChange;
    data.push(Math.max(0, current));
  }
  
  return data;
};

const mockStocks: StockData[] = [
  {
    name: 'S&P Futures',
    ticker: 'ESUSD',
    value: 6799,
    change: -2.75,
    changePercent: -0.04,
    data: generateMockData(6800, 'down', 0.01)
  },
  {
    name: 'NASDAQ',
    ticker: 'NQUSD',
    value: 25538,
    change: -37.25,
    changePercent: -0.15,
    data: generateMockData(25500, 'down', 0.015)
  },
  {
    name: 'Bitcoin',
    ticker: 'BTCUSD',
    value: 100452.36,
    change: 452.36,
    changePercent: 0.45,
    data: generateMockData(100000, 'up', 0.02)
  },
  {
    name: 'VIX',
    ticker: '^VIX',
    value: 18.83,
    change: 1.83,
    changePercent: 10.66,
    data: generateMockData(17, 'up', 0.05)
  }
];

export const MarketOutlook: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Market Outlook</h3>
      <div className="space-y-0">
        {mockStocks.map((stock) => (
          <StockGraph key={stock.ticker} stock={stock} />
        ))}
      </div>
    </div>
  );
};

