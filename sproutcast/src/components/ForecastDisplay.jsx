"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ForecastDisplay({ coordinates }) {
  const [loading, setLoading] = useState(true);

  //simulate fetching weather data whenever the coordinates change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); //fake an 800ms loading time to show off the animation
    return () => clearTimeout(timer);
  }, [coordinates]);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-blue-50 animate-pulse rounded-xl flex items-center justify-center border-2 border-blue-100 shadow-md">
        <p className="text-blue-500 font-semibold">Gathering the latest forecast...</p>
      </div>
    );
  }

  return (
    //The 'key' prop forces Framer Motion to replay the animation every time the coordinates change !
    <motion.div
      key={coordinates.join(",")}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200 w-full h-[400px] flex flex-col justify-center"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Current Weather</h2>
        <span className="text-5xl">🌤️</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Temp</p>
          <p className="text-3xl font-bold text-orange-600">72°F</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Humidity</p>
          <p className="text-3xl font-bold text-blue-600">45%</p>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Conditions</p>
        <p className="text-2xl font-bold text-green-600">Partly Cloudy</p>
      </div>

      <p className="text-center text-gray-600 mt-6 italic">
        "Perfect conditions for watering your tomatoes!"
      </p>
    </motion.div>
  );
}