/*
NOTE: needed to update the seeder to stop using "survival" zones and start
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
    
    // OUTER LOOP: Pages
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`https://perenual.com/api/species-list?key=${API_KEY}&edible=1&page=${page}`);
      const data = await res.json();
      
      if (!data.data) continue;

      // INNER LOOP: Plants on the page
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

        // //Mocking the regions to bypass the 100/day API limit!
        // const possibleRegions = ["North America", "South America", "Europe", "Asia", "Africa", "Australia"];
        // const nativeRegions = possibleRegions[Math.floor(Math.random() * possibleRegions.length)];

        // // Save everything to the database
        // await query(
        //   `INSERT INTO plants 
        //     (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons, native_regions)
        //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        //    ON CONFLICT (external_id) DO UPDATE SET 
        //      min_temp_f = EXCLUDED.min_temp_f, 
        //      max_temp_f = EXCLUDED.max_temp_f, 
        //      seasons = EXCLUDED.seasons,
        //      native_regions = EXCLUDED.native_regions`,
        //   [plant.id, plant.common_name, scientificName, minTempF, maxTempF, watering, sunlight, imageUrl, seasons, nativeRegions]
        // );
        // insertedCount++;

        // NOTE: ran into a 100/day API limit with code below -- above it has mock regional data
        // fetch the specific details for this plant to get its origin
        try {
          const detailsRes = await fetch(`https://perenual.com/api/species/details/${plant.id}?key=${API_KEY}`);
          const detailsData = await detailsRes.json();

          // Grab the origin from the details payload, or fallback to Unknown
          const nativeRegions = detailsData.origin && detailsData.origin.length > 0 
            ? detailsData.origin.join(", ") 
            : "Unknown";

          // Save everything to the database
          await query(
            `INSERT INTO plants 
              (external_id, common_name, scientific_name, min_temp_f, max_temp_f, watering, sunlight, image_url, seasons, native_regions)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (external_id) DO UPDATE SET 
               min_temp_f = EXCLUDED.min_temp_f, 
               max_temp_f = EXCLUDED.max_temp_f, 
               seasons = EXCLUDED.seasons,
               native_regions = EXCLUDED.native_regions`,
            [plant.id, plant.common_name, scientificName, minTempF, maxTempF, watering, sunlight, imageUrl, seasons, nativeRegions]
          );
          insertedCount++;
        } catch (detailErr) {
          console.error(`Skipped details for plant ${plant.id}:`, detailErr);
        }
        
      } //Closed the plant loop
    } //closed the page loop

    // Return success only after both loops are completely finished
    return NextResponse.json({ success: true, message: `Successfully updated ${insertedCount} plants with realistic temperatures!` });

  } catch (error) { // properly attached the main catch block
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}