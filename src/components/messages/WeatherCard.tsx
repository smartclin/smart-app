'use client';

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Zap
} from 'lucide-react';
import type { JSX } from 'react';

interface WeatherData {
  location: string;
  country: string;
  current: {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    name: string;
    temp: number;
    condition: string;
    dayIndex: number;
  }>;
  error: boolean;
  message?: string;
}

interface Props {
  data: WeatherData;
}

const weatherIcons: { [key: string]: JSX.Element } = {
  Clear: <Sun className='size-6 text-muted-foreground sm:size-10' />,
  Clouds: <Cloud className='size-6 text-muted-foreground sm:size-10' />,
  Rain: <CloudRain className='size-6 text-muted-foreground sm:size-10' />,
  Drizzle: <CloudDrizzle className='size-6 text-muted-foreground sm:size-10' />,
  Thunderstorm: <CloudLightning className='size68 text-muted-foreground sm:size-10' />,
  Snow: <CloudSnow className='size-6 text-muted-foreground sm:size-10' />,
  Mist: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Smoke: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Haze: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Dust: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Fog: <CloudFog className='sm:size- size-6 text-muted-foreground' />,
  Sand: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Ash: <CloudFog className='size-6 text-muted-foreground sm:size-10' />,
  Squall: <CloudHail className='size-6 text-muted-foreground sm:size-10' />,
  Tornado: <Zap className='size-6 text-muted-foreground sm:size-10' />
};

const WeatherCard = ({ data }: Props) => {
  if (data.error) {
    return (
      <div className='w-full rounded-xl border border-muted-foreground/15 bg-transparent px-4 shadow-xs dark:shadow-none'>
        <div>
          <div className='flex items-center font-medium text-base text-red-500'>Weather Error</div>
          <div className='text-sm'>{data.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='mb-10'>
      <div>
        <div className='flex items-center font-medium text-base'>
          {data.location} • {data.country}
        </div>
      </div>
      <div className='mt-4 rounded-xl px-0 py-2 shadow-xs outline outline-muted-foreground/15 dark:shadow-none'>
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {weatherIcons[data.current.condition] || weatherIcons.Clear}
              <div>
                <div className='font-bold text-lg sm:text-2xl'>{data.current.temp}°C</div>
                <div className='hidden text-muted-foreground text-sm capitalize sm:block'>
                  {data.current.description}
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-end gap-1 text-muted-foreground text-xs sm:text-sm'>
                <span>Wind</span>
                <span>{data.current.windSpeed} m/s</span>
              </div>
              <div className='flex items-center justify-end gap-1 text-muted-foreground text-xs sm:text-sm'>
                <span>Humidity</span>
                <span>{data.current.humidity}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className='p-4'>
          <div className='grid grid-cols-5 gap-2 sm:gap-4'>
            {data.forecast.map(day => (
              <div
                className='space-y-2 text-center'
                key={day.dayIndex}
              >
                <div className='font-medium text-muted-foreground text-xs'>{day.name}</div>
                <div className='flex justify-center'>
                  {weatherIcons[day.condition] || weatherIcons.Clear}
                </div>
                <div className='font-medium text-sm'>{day.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
