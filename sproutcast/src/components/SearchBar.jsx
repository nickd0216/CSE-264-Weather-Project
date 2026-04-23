//users will type into this search bar, which changes its "state"
//Next.js requires its label to be a client component using "use client"

"use client";

import { useState } from "react";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    //here, this query will eventually be passed to the OpenWeather API fetch function !!
    console.log("Searching for:", searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-md mx-auto w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your city (e.g., Bethlehem, PA)"
          className="w-full px-4 py-3 rounded-full border-2 border-green-300 focus:outline-none focus:border-green-600 shadow-sm text-gray-700"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}