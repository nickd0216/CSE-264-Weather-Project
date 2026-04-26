/*
NOTE: sproutcast/src/app/api/plants/recommendations/route.js API does 
pretty much all the heavy lifting (aka fetching the weather, doing the 
math, checking frost risk). The react component just needs to fetch that 
endpoint and display teh results nicely.

Frame Motion is used to make the plant cards stagger in one by one.

TODO: the test data inserted doesnt have image urls yet, so theres
an image fallback placeholder for now.
*/
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PlantRecommendations({ coordinates }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/plants/recommendations?lat=${coordinates[0]}&lon=${coordinates[1]}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch plants");
        }

        setData(json);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [coordinates]);

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-green-50 animate-pulse rounded-xl flex items-center justify-center border-2 border-green-100 shadow-md mt-8">
        <p className="text-green-600 font-semibold">Finding plants that thrive in this weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 rounded-xl border-2 border-red-200 mt-8 text-center text-red-600">
        <p>Could not load recommendations: {error}</p>
      </div>
    );
  }

  const plants = data?.recommendations || [];

  return (
    <div className="mt-12 mb-20 relative z-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-800">Thriving Right Now</h2>
        <p className="text-gray-600">
          Based on the current temperature ({Math.round(data.current.temp_f)}°F) and a 5-day low of {Math.round(data.forecast_min_f)}°F.
        </p>
      </div>

      {plants.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl shadow border-2 border-gray-100">
          <p className="text-gray-500">No plants match the current temperature. Try another city!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {plants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              //this transition delay makes the cards file in one after the other -- framer motion use
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-md border-2 border-green-100 overflow-hidden flex flex-col"
            >
              {/* NOTE: image placeholder to be used with test data*/}
              <div className="h-40 bg-green-100 flex items-center justify-center relative">
                {plant.image_url ? (
                  <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl opacity-50">🌿</span>
                )}
                
                {/*frost risk badge */}
                {plant.frost_risk && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow flex items-center gap-1">
                    ❄️ Frost Risk
                  </div>
                )}
              </div>

              {/*Plant details!!*/}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 leading-tight">{plant.common_name}</h3>
                <p className="text-xs text-gray-400 italic mb-3">{plant.scientific_name}</p>
                
                <div className="mt-auto space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hardiness:</span>
                    <span className="font-semibold text-gray-700">{plant.min_temp_f}° - {plant.max_temp_f}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sun:</span>
                    <span className="font-semibold text-gray-700 capitalize">{plant.sunlight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Water:</span>
                    <span className="font-semibold text-gray-700 capitalize">{plant.watering}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}