"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ForecastDisplay({ coordinates }) {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  //fetch the REAL weather whenever the coords change
  useEffect(() => {
    const fetchWeather = async () => {
        setLoading(true);
        try{
            //coordinates[0] is lat, coordinates[1] is long
            const res = await fetch(`/api/weather?lat=${coordinates[0]}&lon=${coordinates[1]}`);
            const data = await res.json();
            setWeatherData(data);
        }
        catch (error){
            console.error("Failed to fetch weather", error);
        }
        finally{
            setLoading(false);
        }
    };
    fetchWeather();
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
      className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200 w-full h-[400px] flex flex-col justify-center"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {weatherData.name ? weatherData.name : "Current Weather"}
        </h2>
        {/*NOTE: used OpenWeather's live dynamic icons*/}
        <img 
          src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
          alt={weatherData.weather[0].description}
          className="w-20 h-20 bg-blue-100 rounded-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Temp</p>
          {/*Math.round removes the decimals from the temperature */}
          <p className="text-3xl font-bold text-orange-600">{Math.round(weatherData.main.temp)}°F</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Humidity</p>
          <p className="text-3xl font-bold text-blue-600">{weatherData.main.humidity}%</p>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Conditions</p>
        <p className="text-2xl font-bold text-green-600 capitalize">
          {weatherData.weather[0].description}
        </p>
      </div>
    </motion.div>
  );
}