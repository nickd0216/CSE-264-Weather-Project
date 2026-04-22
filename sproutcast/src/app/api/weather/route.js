// src/app/api/weather/route.js
// GET /api/weather?lat=40.6&lon=-75.4
//   or
// GET /api/weather?city=Bethlehem
//
// Reads from weather_cache first; falls back to OpenWeather on miss or if
// the cache entry is older than CACHE_TTL_MS. Writes through on fresh fetch.
//
// Why cache: OpenWeather free tier allows 60 calls/min. A class demo with
// 3 users refreshing the page will blow through that fast if every render
// hits the network. 10 minutes is plenty fresh for weather.

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { fetchWeather, geocodeCity } from '@/lib/api/openweather';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(req) {
  try {
    const url = new URL(req.url);
    let lat = url.searchParams.get('lat');
    let lon = url.searchParams.get('lon');
    const city = url.searchParams.get('city');

    // If caller gave us a city name, geocode it first.
    let resolvedName = null;
    if ((!lat || !lon) && city) {
      const geo = await geocodeCity(city);
      if (!geo) {
        return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }
      lat = geo.lat;
      lon = geo.lon;
      resolvedName = `${geo.name}${geo.state ? ', ' + geo.state : ''}`;
    }

    if (lat == null || lon == null) {
      return NextResponse.json(
        { error: 'Provide lat & lon, or city' },
        { status: 400 },
      );
    }

    // Round to 2 decimal places (~1km) for a stable cache key. No need to
    // refetch when two users in the same neighborhood hit us.
    const latR = Number(lat).toFixed(2);
    const lonR = Number(lon).toFixed(2);
    const locationKey = `${latR},${lonR}`;

    // 1. Look in cache
    const cached = await query(
      `SELECT data, fetched_at FROM weather_cache WHERE location_key = $1`,
      [locationKey],
    );
    if (cached.length) {
      const age = Date.now() - new Date(cached[0].fetched_at).getTime();
      if (age < CACHE_TTL_MS) {
        return NextResponse.json({ source: 'cache', ...cached[0].data });
      }
    }

    // 2. Cache miss or stale: hit OpenWeather
    const weather = await fetchWeather({ lat: latR, lon: lonR });
    if (resolvedName) weather.location.name = resolvedName;

    // 3. Write through (upsert)
    await query(
      `INSERT INTO weather_cache (location_key, data, fetched_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (location_key) DO UPDATE SET
         data = EXCLUDED.data,
         fetched_at = EXCLUDED.fetched_at`,
      [locationKey, JSON.stringify(weather)],
    );

    return NextResponse.json({ source: 'fresh', ...weather });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}