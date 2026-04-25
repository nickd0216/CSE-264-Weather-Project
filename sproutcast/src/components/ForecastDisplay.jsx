"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ForecastDisplay({ coordinates }) {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  //fetch the REAL weather whenever the coords change
  useEffect(() => {
    const fetchWeatherAndForecast = async () => {
        setLoading(true);
        try{
            //fetch both APIs at the same time to speed up loading
            const [weatherRes, forecastRes] = await Promise.all([
                fetch(`/api/weather?lat=${coordinates[0]}&lon=${coordinates[1]}`),
                fetch(`/api/forecast?lat=${coordinates[0]}&lon=${coordinates[1]}`)
            ]);
            const currentData = await weatherRes.json();
            const futureData = await forecastRes.json();

            setWeatherData(currentData);
            
            //the forecast api returns 40 timestamps -- aka every 3 hrs
            //filter it to just grab one daytime reading (abt 12 pm) for the next 5 days
            if(futureData.list){
                const days = {};
                futureData.list.forEach(item => {
                    const dateStr = item.dt_txt.split(" ")[0]; //extracts just the YYYY-MM-DD

                    if(!days[dateStr]){
                        days[dateStr] = {
                            dt : item.dt,
                            temps : [],
                            icon : item.weather[0].icon.replace('n', 'd') //defaults to day icon
                        };
                    }

                    //collect all temps for this specific day
                    days[dateStr].temps.push(item.main.temp);

                    //if its the noon reading, use its specific weather icon
                    if(item.dt_txt.includes("12:00:00")){
                        days[dateStr].icon = item.weather[0].icon;
                    }
                });
                //map through grouped days to find the min and max temps
                const dailyForecasts = Object.values(days).slice(0, 5).map(day => {
                    return{
                        dt: day.dt,
                        icon : day.icon,
                        high : Math.round(Math.max(...day.temps)),
                        low : Math.round(Math.min(...day.temps))
                    };
                });
                setForecastData(dailyForecasts);
            }
        }
        catch(error){
            console.error("Failed to fetch data", error);
        }
        finally{
            setLoading(false);
        }
    };
    fetchWeatherAndForecast();
  }, [coordinates]);

  //show the pulsing loading screen while waiting for OpenWeather
  if (loading || !weatherData) {
    return (
      <div className="w-full h-[400px] bg-blue-50 animate-pulse rounded-xl flex items-center justify-center border-2 border-blue-100 shadow-md">
        <p className="text-blue-500 font-semibold">Gathering the latest forecast...</p>
      </div>
    );
  }

  //If the data comes back but it's an error, show an error card
  if (weatherData.error || !weatherData.weather) {
    return (
      <div className="w-full h-[400px] bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200 shadow-md p-8 text-center">
        <div>
          <p className="text-4xl mb-4">🌩️</p>
          <p className="text-red-600 font-semibold mb-2">Weather unavailable</p>
          <p className="text-sm text-red-400">
            {weatherData.error || weatherData.message || "Something went wrong fetching the forecast."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={coordinates.join(",")}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      //NOTE:changed from fixed h-[400px] to h-full so it flexes nicely
      className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200 w-full h-full flex flex-col justify-between"
    >
      {/*CURRENT WEATHER SECTION*/}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">
            {weatherData.name ? weatherData.name : "Current Weather"}
          </h2>
          <img 
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
            alt={weatherData.weather[0].description}
            className="w-16 h-16 bg-blue-100 rounded-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Temp</p>
            <p className="text-2xl font-bold text-orange-600">{Math.round(weatherData.main.temp)}°F</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Humidity</p>
            <p className="text-2xl font-bold text-blue-600">{weatherData.main.humidity}%</p>
          </div>
        </div>
      </div>

      {/*5-DAY FORECAST SECTION*/}
      <div className="mt-4 pt-4 border-t-2 border-gray-100">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-semibold">5-Day Forecast</p>
        <div className="grid grid-cols-5 gap-2">
          {forecastData.map((day, index) => {
            //format the date text into a short day name (e.g., "Mon", "Tue")
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={index} className="flex flex-col items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-600">{dayName}</p>
                <img 
                  src={`http://openweathermap.org/img/wn/${day.icon}.png`} 
                  alt="Weather Icon"
                  className="w-10 h-10"
                />
                <div className="flex gap-1 text-sm font-bold mt-1">
                    <span className="text-gray-800">{day.high}°</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-blue-600">{day.low}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}