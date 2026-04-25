import { NextResponse } from 'next/server';

export async function GET(request){
  //get the search query from the URL (e.g., ?q=Bethlehem)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if(!query){
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  //securely access the API key from .env.local file
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

  try{
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  }
  catch (error) {
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 });
  }
}