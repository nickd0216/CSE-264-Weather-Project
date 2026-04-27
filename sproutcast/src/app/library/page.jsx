/*
NOTE: for scalability (when there are a lot of plants in the db), 
this catalog was built so users can search through all the 
plants without scrolling endlessly. The backend route takes care
of the filtering, so just need to send it the right search terms!
*/

"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PlantCatalog() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  //filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [season, setSeason] = useState("");
  const [sunlight, setSunlight] = useState("");
  const [watering, setWatering] = useState("");

  //fetch plants whenever the search query changes !!
  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        //FIX(?): build the URL dynamically based on what filters are selected
        let url = `/api/plants?limit=24`;
        if (searchQuery) url += `&q=${searchQuery}`;
        if (season) url += `&season=${season}`;
        if (sunlight) url += `&sunlight=${sunlight}`;
        if (watering) url += `&watering=${watering}`;

        const res = await fetch(url);
        const data = await res.json();
        setPlants(data.plants || []);
      } 
      catch (error) {
        console.error("Failed to fetch catalog:", error);
      } 
      finally {
        setLoading(false);
      }
    };

    //NOTE: add a tiny delay (debounce) so it doesn't search on every single keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchPlants();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, season, sunlight, watering]);

  return (
    <div className="mt-16 mb-20 bg-white p-8 rounded-2xl shadow-sm border border-green-100 relative z-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-800">Plant Library</h2>
        <p className="text-gray-600">Search our database of garden and edible plants.</p>
      </div>
      
      {/*search and filter bar!*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-green-200 focus:outline-none focus:border-green-500"
        />
        
        <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 bg-white">
          <option value="">Any Season</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
          <option value="winter">Winter</option>
        </select>

        <select value={sunlight} onChange={(e) => setSunlight(e.target.value)} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 bg-white">
          <option value="">Any Sun</option>
          <option value="full sun">Full Sun</option>
          <option value="part shade">Part Shade</option>
        </select>

        <select value={watering} onChange={(e) => setWatering(e.target.value)} className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 bg-white">
          <option value="">Any Water Needs</option>
          <option value="frequent">Frequent</option>
          <option value="average">Average</option>
          <option value="minimum">Minimum</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-green-50 h-48 rounded-xl border border-green-100"></div>
          ))}
        </div>
      ) : plants.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          No plants found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
            >
              <div className="h-32 bg-gray-200 overflow-hidden relative shrink-0">
                {plant.image_url ? (
                  <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🌿</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 truncate text-lg">{plant.common_name}</h3>
                <p className="text-xs text-gray-500 italic truncate mb-2">{plant.scientific_name}</p>
                <div className="flex gap-2 mt-auto">
                  <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded truncate">
                    {plant.sunlight.split(',')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded truncate">
                    {plant.watering.split(' ')[0]}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}