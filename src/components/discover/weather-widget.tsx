import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react';

interface WeatherData {
  location: string;
  currentTemp: number;
  condition: string;
  high: number;
  low: number;
  forecast: Array<{
    day: string;
    temp: number;
    icon: string;
  }>;
}

// Mock weather data
const mockWeatherData: WeatherData = {
  location: 'Roslyn, Winnipeg',
  currentTemp: 3,
  condition: 'Clear',
  high: 8,
  low: -1,
  forecast: [
    { day: 'Tuesday', temp: 8, icon: 'sun' },
    { day: 'Wednesday', temp: 4, icon: 'cloud' },
    { day: 'Thursday', temp: 5, icon: 'cloud' },
    { day: 'Friday', temp: -2, icon: 'snow' },
    { day: 'Saturday', temp: -1, icon: 'cloud' }
  ]
};

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes('clear') || lower.includes('sun')) {
    return <Sun className="w-5 h-5 text-yellow-500" />;
  }
  if (lower.includes('rain')) {
    return <CloudRain className="w-5 h-5 text-blue-500" />;
  }
  if (lower.includes('snow')) {
    return <Snowflake className="w-5 h-5 text-blue-300" />;
  }
  if (lower.includes('wind')) {
    return <Wind className="w-5 h-5 text-gray-500" />;
  }
  return <Cloud className="w-5 h-5 text-gray-400" />;
};

const getForecastIcon = (icon: string) => {
  switch (icon) {
    case 'sun':
      return <Sun className="w-4 h-4 text-yellow-500" />;
    case 'rain':
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    case 'snow':
      return <Snowflake className="w-4 h-4 text-blue-300" />;
    case 'wind':
      return <Wind className="w-4 h-4 text-gray-500" />;
    default:
      return <Cloud className="w-4 h-4 text-gray-400" />;
  }
};

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(mockWeatherData);
  const [isCelsius, setIsCelsius] = useState(true);

  // In a real app, you would fetch weather data here
  useEffect(() => {
    // Fetch weather data logic would go here
  }, []);

  const toggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const formatTemp = (temp: number) => {
    return `${temp}°`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-gray-900">
            {formatTemp(weather.currentTemp)}
          </span>
          <button
            onClick={toggleUnit}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            aria-label="Toggle temperature unit"
          >
            F/C
          </button>
        </div>
        {getWeatherIcon(weather.condition)}
      </div>
      
      <div className="text-sm text-gray-600 mb-1">{weather.location}</div>
      <div className="text-sm text-gray-500 mb-4">{weather.condition}</div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <span>H: {formatTemp(weather.high)}</span>
        <span>L: {formatTemp(weather.low)}</span>
      </div>

      <div className="space-y-2">
        {weather.forecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              {getForecastIcon(day.icon)}
              <span className="text-gray-600">{day.day}</span>
            </div>
            <span className="text-gray-900 font-medium">
              {formatTemp(day.temp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

