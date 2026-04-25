// src/app/api/plants/recommendations/route.js
// GET /api/plants/recommendations?lat=40.6&lon=-75.4&season=spring
//
// The "Thriving Right Now" feature from the spec. Given a location, fetch the
// current weather, then return plants whose hardiness range covers the current
// temperature. This is what makes SproutCast different from a generic weather app.
//
// We do the weather fetch server-side (reusing the cache) so the client only
// makes one request. Frontend just passes lat/lon and gets back ranked plants.

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { fetchWeather, geocodeCity } from '@/lib/api/openweather';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    let lat = url.searchParams.get('lat');
    let lon = url.searchParams.get('lon');
    const city = url.searchParams.get('city');
    const season = url.searchParams.get('season'); // optional extra filter

    if ((!lat || !lon) && city) {
      const geo = await geocodeCity(city);
      if (!geo) {
        return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }
      lat = geo.lat;
      lon = geo.lon;
    }
    if (lat == null || lon == null) {
      return NextResponse.json(
        { error: 'Provide lat & lon, or city' },
        { status: 400 },
      );
    }

    // Reuse the caching logic by calling the weather route? We could, but one
    // function call is faster than one HTTP round trip to ourselves.
    const weather = await fetchWeather({ lat, lon });
    const currentTempF = weather.current.temp_f;
    const forecastMin = Math.min(...weather.forecast.map((d) => d.temp_min_f));

    // Match plants whose hardiness range covers the current temp.
    // We also order by how well-centered the current temp sits in their range —
    // a plant happy from 50-90°F at 70°F is a better match than one happy 30-60°F.
    const where = ['min_temp_f <= $1', 'max_temp_f >= $1'];
    const params = [currentTempF];
    let i = 2;

    if (season) {
      where.push(`(',' || seasons || ',') ILIKE $${i}`);
      params.push(`%,${season},%`);
      i++;
    }

    const plants = await query(
      `SELECT id, external_id, common_name, scientific_name, description,
              min_temp_f, max_temp_f, watering, sunlight, image_url, seasons,
              ABS(((min_temp_f + max_temp_f) / 2.0) - $1) AS distance_from_ideal
       FROM plants
       WHERE ${where.join(' AND ')}
       ORDER BY distance_from_ideal ASC
       LIMIT 24`,
      params,
    );

    // Flag plants at risk of frost in the 5-day forecast.
    const withRisk = plants.map((p) => ({
      ...p,
      frost_risk: p.min_temp_f != null && forecastMin < p.min_temp_f,
    }));

    return NextResponse.json({
      location: weather.location,
      current: weather.current,
      forecast_min_f: forecastMin,
      recommendations: withRisk,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 },
    );
  }
}