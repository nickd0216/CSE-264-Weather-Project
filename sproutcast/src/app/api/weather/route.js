/*
IMPORTANT NOTE: 
Right now, I am temporarily overwriting Nick's version of this file with a 
simple version. This will unblock me immediately so I can finish building out the UI.
Later, when we merge our branches together, I can connect my frontend with his finished
database logic. The main reasons for the crash are:
     1. No database: I dont have the postgresql database set up and running locally yet. 
     When Nicks code tries to run query(...) to check the weather_cache table, it insta fails
     and throws a 500 error.
     2. data mismatch: Nick's version of the file uses a custom helper func (fetchWeather) which 
     (probably) formats the weather data differently than the raw OpenWeather JSON my frontend
     is currently expecting (like weatherData.main.temp)
*/

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  // Fetching current weather data in Fahrenheit
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.cod && data.cod !== 200) {
      return NextResponse.json({ error: data.message }, { status: data.cod });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}