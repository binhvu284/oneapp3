import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
}

const WEATHER_ICONS: Record<string, typeof Sun> = {
  "01": Sun,
  "02": Cloud,
  "03": Cloud,
  "04": Cloud,
  "09": CloudDrizzle,
  "10": CloudRain,
  "11": CloudLightning,
  "13": CloudSnow,
  "50": Wind,
};

interface WeatherWidgetProps {
  config?: Record<string, any>;
  onConfigChange?: (c: Record<string, any>) => void;
}

export default function WeatherWidget({ config }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const city = config?.city ?? "";

  useEffect(() => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        let url = "https://api.open-meteo.com/v1/forecast?";
        if (lat && lon) {
          url += `latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        } else {
          // Default to Ho Chi Minh City
          url += `latitude=10.82&longitude=106.63&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const current = data.current;
        const code = current.weather_code;
        const desc = getWeatherDescription(code);
        const iconKey = getWeatherIcon(code);
        
        setWeather({
          temp: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          description: desc,
          icon: iconKey,
          city: city || (lat ? "Current Location" : "Ho Chi Minh"),
        });
      } catch {
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      // Use geocoding for city name
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
        .then((r) => r.json())
        .then((data) => {
          if (data.results?.[0]) {
            fetchWeather(data.results[0].latitude, data.results[0].longitude);
          } else {
            fetchWeather();
          }
        })
        .catch(() => fetchWeather());
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 5000 }
      );
    } else {
      fetchWeather();
    }
  }, [city]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-muted-foreground">Weather unavailable</p>
      </div>
    );
  }

  const IconComp = WEATHER_ICONS[weather.icon] || Cloud;

  return (
    <div className="flex items-center justify-between h-full px-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-foreground">{weather.temp}°C</span>
        <span className="text-[10px] text-muted-foreground capitalize">{weather.description}</span>
        <span className="text-[10px] text-muted-foreground/60">{weather.city}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <IconComp className="w-8 h-8 text-primary" />
        <span className="text-[10px] text-muted-foreground">{weather.humidity}% hum</span>
      </div>
    </div>
  );
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "01";
  if (code <= 3) return "02";
  if (code <= 48) return "50";
  if (code <= 57) return "09";
  if (code <= 67) return "10";
  if (code <= 77) return "13";
  if (code <= 82) return "10";
  if (code <= 86) return "13";
  if (code <= 99) return "11";
  return "03";
}
