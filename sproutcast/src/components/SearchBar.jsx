//users will type into this search bar, which changes its "state"
//Next.js requires its label to be a client component using "use client"

"use client";

import { useState, useEffect } from "react";

//accept the onCitySelect prop here
export default function SearchBar({onCitySelect}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  //this useEffect watches the searchQuery and runs whenever it changes
  useEffect(() => {
    //dont search if the user has typed less than 3 characters !!
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    //debounce: wait 500ms after the user stops typing to fetch
    const delayDebounceFn = setTimeout(async () => {
      try{
        const response = await fetch(`/api/geocode?q=${searchQuery}`);
        const data = await response.json();
        //if data is an array, update suggestions list
        if(Array.isArray(data)){
          setSuggestions(data);
        }
      }
      catch (error){
        console.error("Error fetching locations:", error);
      }
    }, 500);

    //cleanup function to cancel timeout if user keeps typing
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Manually searching for:", searchQuery);
  };

  const handleSelectCity = (city) => {
    //format city name nicely for the input box
    const cityName = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
    setSearchQuery(cityName);
    setSuggestions([]); //close the dropdown !!
    
    //send the newly selected coordinates up to page.js
    if(onCitySelect){
        onCitySelect([city.lat, city.lon]);
    }
    //now have the exact coordinates to fetch the weather next !
    //console.log("Selected coordinates for weather fetch:", city.lat, city.lon);
  };

  return (
    <div className="max-w-md mx-auto w-full relative">
      <form onSubmit={handleSearch}>
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

      {/* Auto-complete dropdown box */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((city, index) => (
            <li
              key={index}
              onClick={() => handleSelectCity(city)}
              className="px-4 py-3 hover:bg-green-50 cursor-pointer text-gray-700 border-b last:border-b-0"
            >
              {city.name}{city.state ? `, ${city.state}` : ''}, {city.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}