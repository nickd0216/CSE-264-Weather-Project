import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

//a rough helper to convert USDA Hardiness Zones to min F temps
const zoneToMinTemp = {
  1: -50, 2: -40, 3: -30, 4: -20, 5: -10, 
  6: 0,   7: 10,  8: 20,  9: 30,  10: 40, 
  11: 50, 12: 60, 13: 70
};

export async function GET(request) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing Perenual API Key" }, { status: 500 });
  }

  try {
    //fetch page 1 of edible/garden plants from Perenual
    const res = await fetch(`https://perenual.com/api/species-list?key=${API_KEY}&edible=1&page=1`);
    const data = await res.json();

    if (!data.data) {
      return NextResponse.json({ error: "No data returned from Perenual" }, { status: 400 });
    }

    let insertedCount = 0;

    //loop through the Perenual plants and insert them into the db
    for (const plant of data.data) {
      // Only skip if it doesn't even have a name
      if (!plant.common_name) continue;

      //extract hardiness, default to zone 5 if Perenual didn't provide it
      let minZone = 5;
      if (plant.hardiness && plant.hardiness.min) {
        minZone = parseInt(plant.hardiness.min.replace(/[^\d]/g, '')) || 5;
      }

      const minTempF = zoneToMinTemp[minZone] || 0;
      const maxTempF = 95; 

      const sunlight = plant.sunlight ? plant.sunlight.join(", ") : "Full sun";
      const watering = plant.watering || "average";
      const imageUrl = plant.default_image?.regular_url || null;
      const scientificName = plant.scientific_name ? plant.scientific_name[0] : null;
      
      const seasons = "spring,summer,fall"; //give a wide season range for testing

      //insert into neon db
      await query(
        `INSERT INTO plants 
          (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (external_id) DO NOTHING`,
        [plant.id, plant.common_name, scientificName, minTempF, maxTempF, watering, sunlight, imageUrl, seasons]
      );
      insertedCount++;
    }
    /* IGNORE-- previous debugging
      // 3. Insert into Neon
      await query(
        `INSERT INTO plants 
          (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (external_id) DO NOTHING`,
        [
          plant.id, 
          plant.common_name, 
          scientificName, 
          minTempF, 
          maxTempF, 
          watering, 
          sunlight, 
          imageUrl, 
          seasons
        ]
      );
      insertedCount++;
    }
      */

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${insertedCount} real plants from Perenual into your database!` 
    });

  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}