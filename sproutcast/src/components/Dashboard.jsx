//this is a client component, so it can keep all the useState logic and the dynamic map import
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./SearchBar";
import ForecastDisplay from "./ForecastDisplay";
import PlantRecommendations from "./PlantRecommendations";

// 1. moved the dynamic map import here!
// Note: The path is now "./Map" because Dashboard is in the same folder as Map.
const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-green-100 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-green-800 font-semibold">Loading Map...</p>
    </div>
  ),
});

// 2. Accept the currentUserID passed down from page.js
export default function Dashboard({ currentUserID }) {
  // First, create a state to hold the coordinates (default: Bethlehem, PA)
  const [mapCoordinates, setMapCoordinates] = useState([40.6259, -75.3705]);

  return (
    <>
      {/* The imported search bar */}
      <div className="mb-12">
        {/* Pass the 'setter' function to the SearchBar so it can update the coordinates */}
        <SearchBar onCitySelect={setMapCoordinates}/>
      </div>
      
      {/* Wrap them in CSS Grid -- 1 col on mobile, 2 cols on med+ screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-8 relative z-0">
        {/* Left col: the map */}
        <div className="w-full">
          <MapComponent coordinates={mapCoordinates} />
        </div>

        {/* Right col: forecast */}
        <div className="w-full">
          <ForecastDisplay coordinates={mapCoordinates} />
        </div>
      </div>

      {/* Existing recommendations -- Pass the ID down as a prop! */}
      <div className="max-w-6xl mx-auto">
        <PlantRecommendations 
          coordinates={mapCoordinates} 
          userId={currentUserID} 
        />
      </div>
    </>
  );
}