"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VirtualGarden() {
  // Start assuming they are logged in; the real API will tell us if they aren't!
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [myPlants, setMyPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL FETCH: Grab the user's actual saved plants
    const fetchGarden = async () => {
      try {
        const res = await fetch("/api/garden"); 
        
        // If the backend blocks us, it means the user isn't logged in!
        if (res.status === 401 || res.status === 403) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch garden");

        const data = await res.json();
        // backend sends the rows inside an "entries" array
        setMyPlants(data.entries || []);
      } catch (error) {
        console.error("Failed to load garden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGarden();
  }, []);

  // REAL REMOVE: Deletes the plant from the database
  const removeFromGarden = async (entryId) => {
    // 1. hide it from the screen instantly for a snappy UI
    setMyPlants((prevPlants) => prevPlants.filter(plant => plant.id !== entryId));

    try {
      // 2. Tell the database to delete it permanently
      const res = await fetch(`/api/garden?id=${entryId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        console.error("Failed to delete from database");
        // future iteration: can fetch the garden again here to bring the plant back if the db failed
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // --- UI RENDER: LOGGED OUT ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Your Virtual Garden</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Please log in or create a free account to save plants, track your garden, and get personalized recommendations.
        </p>
        <Link href="/login">
          <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition">
            Log In to SproutCast
          </button>
        </Link>
      </div>
    );
  }

  // --- UI RENDER: LOGGED IN ---
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-green-200 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-green-800">My Virtual Garden</h1>
          <p className="text-gray-600 mt-2">Track and manage your favorite plants.</p>
        </div>
        <Link href="/library">
          <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition whitespace-nowrap">
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
          <Link href="/library">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition">
              Explore Plants
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {myPlants.map((plant, index) => (
            <motion.div
              key={plant.id} // Note: this is the garden_entry ID, not the plant ID!
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