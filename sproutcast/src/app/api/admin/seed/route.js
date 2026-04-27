import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const zoneToMinTemp = { 1: -50, 2: -40, 3: -30, 4: -20, 5: -10, 6: 0, 7: 10, 8: 20, 9: 30, 10: 40, 11: 50, 12: 60, 13: 70 };
const possibleSeasons = ['spring', 'summer', 'fall', 'winter', 'spring,summer', 'summer,fall'];

export async function GET(request) {
  const API_KEY = process.env.PERENUAL_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    let insertedCount = 0;
    
    //FETCH 5 PAGES (30 plants * 5 = 150 plants)
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`https://perenual.com/api/species-list?key=${API_KEY}&edible=1&page=${page}`);
      const data = await res.json();
      
      if (!data.data) continue;

      for (const plant of data.data) {
        if (!plant.common_name) continue;

        let minZone = 5;
        if (plant.hardiness && plant.hardiness.min) {
          minZone = parseInt(plant.hardiness.min.replace(/[^\d]/g, '')) || 5;
        }

        const minTempF = zoneToMinTemp[minZone] || 0;
        
        //give plants a random max temp between 75 and 105
        //EXAMPLE: if it's 85 degrees outside, plants with a max of 80 will NOT show up in "Thriving"
        const maxTempF = 75 + Math.floor(Math.random() * 30); 

        const sunlight = plant.sunlight ? plant.sunlight.join(", ") : "Full sun";
        const watering = plant.watering || "average";
        const imageUrl = plant.default_image?.regular_url || null;
        const scientificName = plant.scientific_name ? plant.scientific_name[0] : null;
        
        //randomly assign seasons so the filter works
        const seasons = possibleSeasons[Math.floor(Math.random() * possibleSeasons.length)];

        //notice the 'ON CONFLICT DO UPDATE' — this overwrites the bad data inserted previously
        await query(
          `INSERT INTO plants 
            (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (external_id) DO UPDATE SET 
             min_temp_f = EXCLUDED.min_temp_f, 
             max_temp_f = EXCLUDED.max_temp_f, 
             seasons = EXCLUDED.seasons,
             sunlight = EXCLUDED.sunlight`,
          [plant.id, plant.common_name, scientificName, minTempF, maxTempF, watering, sunlight, imageUrl, seasons]
        );
        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} real plants!` });

  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}