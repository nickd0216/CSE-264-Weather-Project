"use client"; //need this here because by default Next.js treats page.js
//as a server component -- but need next.js to treat the entire homepage as 
//a client component so it knows to run it in the browser since the map uses ssr: false

import { useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "../components/SearchBar";

//this tells Next.js to ONLY load the map on the client side (browser), avoiding ssr crashes
const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-green-100 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-green-800 font-semibold">Loading Map...</p>
    </div>
  ),
});

export default function Home() {
  //First, create a state to hold the coordinates (default: Bethlehem, PA)
  const [mapCoordinates, setMapCoordinates] = useState([40.6259, -75.3705]);

  return (
    <main className="min-h-screen p-8 bg-green-50">
      <h1 className="text-4xl font-bold text-green-800 mb-4">
        Welcome to SproutCast
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        The gardening weather platform!
      </p>
      
      {/*the imported search bar*/}
      <div className="mb-12">
        {/*pass the 'setter' function to the SearchBar so it can update the coordinates*/}
        <SearchBar onCitySelect={setMapCoordinates}/>
      </div>
      
      {/*the dynamically loaded map !!*/}
      <div className="max-w-4xl mx-auto mt-8">
        { /*pass the current coordinates to the map so it knows where to look */}
        <MapComponent coordinates={mapCoordinates} />
      </div>
    </main>
  );
}