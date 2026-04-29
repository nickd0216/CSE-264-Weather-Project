/*
NOTE: sproutcast/src/app/api/plants/recommendations/route.js API does 
pretty much all the heavy lifting (aka fetching the weather, doing the 
math, checking frost risk). The react component just needs to fetch that 
endpoint and display teh results nicely.

Frame Motion is used to make the plant cards stagger in one by one.

*/
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PlantRecommendations({ coordinates, userId }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  //state for the drop down
  const [region, setRegion] = useState("");

  const handleAddToGarden = async (plantId) => {
    //Check if the userId prop actually exists (meaning they are logged in)
    if (!userId) {
      alert("Please log in to save plants to your Virtual Garden! 🌱");
      return;
    }

    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the real userId to the database!
        body: JSON.stringify({ plant_id: plantId }) 
      });
      
      if (res.ok) {
        alert("Added to your Virtual Garden! 🌿");
      } else {
        const errorData = await res.json();
        alert(`Failed to add plant: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        //build url dynamically based on region selection
        let url = `/api/plants/recommendations?lat=${coordinates[0]}&lon=${coordinates[1]}`;
        if (region) url += `&region=${region}`;

        const res = await fetch(url);
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
  }, [coordinates, region]); //rerun if coords OR region changes

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-green-50 animate-pulse rounded-xl flex items-center justify-center border-2 border-green-100 shadow-md mt-8">
        <p className="text-green-600 font-semibold">Finding plants that thrive in this weather/region...</p>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-green-800">Thriving Right Now</h2>
          <p className="text-gray-600">
            Based on current temp ({Math.round(data.current.temp_f)}°F) and forecast.
          </p>
        </div>

      {/*region dropdown*/}
      <select 
          value={region} 
          onChange={(e) => setRegion(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-green-200 focus:outline-none focus:border-green-500 bg-white font-medium text-gray-700 shadow-sm"
        >
          <option value="">🌍 All Global Plants</option>
          <option value="North America">North America</option>
          <option value="South America">South America</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
          <option value="Africa">Africa</option>
          <option value="Australia">Australia</option>
        </select>
      </div>

      {plants.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl shadow border-2 border-gray-100">
          <p className="text-gray-500">No plants match the current temperature and region. Try another city!</p>
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
                  {/*added the Add to Garden button*/}
                  <button 
                    onClick={() => handleAddToGarden(plant.id)}
                    className="w-full mt-4 bg-green-100 hover:bg-green-200 text-green-800 font-bold py-2 px-4 rounded transition-colors"
                  >
                    + Add to Garden
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}