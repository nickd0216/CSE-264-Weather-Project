"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VirtualGarden() {
  // 1. MOCK AUTH STATE: Toggle this to false to see what logged-out users will see!
  const [isAuthenticated, setIsAuthenticated] = useState(true); 

  // 2. GARDEN STATE
  const [myPlants, setMyPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 3. MOCK FETCH: Grabbing a few plants from the public API to use as "saved" plants
    // Chris will replace this URL with his authenticated `/api/garden` route later!
    const fetchGarden = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await fetch("/api/plants?limit=4"); 
        const data = await res.json();
        setMyPlants(data.plants || []);
      } catch (error) {
        console.error("Failed to load garden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGarden();
  }, [isAuthenticated]);

  // 4. MOCK REMOVE: Visually removes the plant. Chris will add the actual DELETE API call here.
  const removeFromGarden = (plantId) => {
    setMyPlants(myPlants.filter(plant => plant.id !== plantId));
  };

  // --- UI RENDER: LOGGED OUT ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Your Virtual Garden</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Please log in or create a free account to save plants, track your garden, and get personalized recommendations.
        </p>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition">
          Log In to SproutCast
        </button>
      </div>
    );
  }

  // --- UI RENDER: LOGGED IN ---
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 min-h-screen">
      <div className="flex justify-between items-end mb-8 border-b border-green-200 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-green-800">My Virtual Garden</h1>
          <p className="text-gray-600 mt-2">Track and manage your favorite plants.</p>
        </div>
        <Link href="/library">
          <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition">
            + Add More Plants
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-green-50 h-64 rounded-xl border border-green-100"></div>
          ))}
        </div>
      ) : myPlants.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4 opacity-50">🪴</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your garden is empty!</h2>
          <p className="text-gray-500 mb-6">Go back to the Plant Library to search and save plants to your garden.</p>
          <Link href="/">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition">
              Explore Plants
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {myPlants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition group flex flex-col"
            >
              <div className="h-40 bg-gray-200 overflow-hidden relative shrink-0">
                {plant.image_url ? (
                  <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🌿</div>
                )}
                <button 
                  onClick={() => removeFromGarden(plant.id)}
                  className="absolute top-2 right-2 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                  title="Remove from garden"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{plant.common_name}</h3>
                <p className="text-xs text-gray-500 italic mb-3">{plant.scientific_name}</p>
                
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="text-gray-500">Watering</span>
                    <span className="font-semibold text-blue-700 capitalize">{plant.watering.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="text-gray-500">Sunlight</span>
                    <span className="font-semibold text-orange-600 capitalize">{plant.sunlight.split(',')[0]}</span>
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