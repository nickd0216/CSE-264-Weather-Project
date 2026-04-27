/*
NOTE: needed to update the seeder to stop using "survial" zones and start
using realistic growing temp ranges based on the season. 
*/
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const possibleSeasons = ['spring', 'summer', 'fall', 'winter', 'spring,summer', 'summer,fall'];

export async function GET(request) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    let insertedCount = 0;
    
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`https://perenual.com/api/species-list?key=${API_KEY}&edible=1&page=${page}`);
      const data = await res.json();
      
      if (!data.data) continue;

      for (const plant of data.data) {
        if (!plant.common_name) continue;

        // Randomize the season first
        const seasons = possibleSeasons[Math.floor(Math.random() * possibleSeasons.length)];

        // Assign realistic, narrow growing temperatures based on the season!
        let minTempF = 50;
        let maxTempF = 85;

        if (seasons.includes('winter')) {
          minTempF = 20 + Math.floor(Math.random() * 10); // 20 - 29
          maxTempF = 55 + Math.floor(Math.random() * 10); // 55 - 64
        } else if (seasons.includes('summer')) {
          minTempF = 60 + Math.floor(Math.random() * 10); // 60 - 69
          maxTempF = 85 + Math.floor(Math.random() * 15); // 85 - 99
        } else {
          // Spring or Fall
          minTempF = 40 + Math.floor(Math.random() * 10); // 40 - 49
          maxTempF = 70 + Math.floor(Math.random() * 15); // 70 - 84
        }

        const sunlight = plant.sunlight ? plant.sunlight.join(", ") : "Full sun";
        const watering = plant.watering || "average";
        const imageUrl = plant.default_image?.regular_url || null;
        const scientificName = plant.scientific_name ? plant.scientific_name[0] : null;

        // ON CONFLICT DO UPDATE automatically overwrites the bad temperature ranges we saved earlier!
        await query(
          `INSERT INTO plants 
            (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (external_id) DO UPDATE SET 
             min_temp_f = EXCLUDED.min_temp_f, 
             max_temp_f = EXCLUDED.max_temp_f, 
             seasons = EXCLUDED.seasons`,
          [plant.id, plant.common_name, scientificName, minTempF, maxTempF, watering, sunlight, imageUrl, seasons]
        );
        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully updated ${insertedCount} plants with realistic temperatures!` });

  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}