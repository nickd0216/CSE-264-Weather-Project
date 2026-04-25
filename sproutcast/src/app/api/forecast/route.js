import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  //this endpoint returns data for the next 5 days (in 3-hour chunks)
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.cod && data.cod !== "200") {
      return NextResponse.json({ error: data.message }, { status: parseInt(data.cod) });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 });
  }
}