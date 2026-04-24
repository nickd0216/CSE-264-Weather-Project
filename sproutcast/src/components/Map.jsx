/*
Logic note on setting up the Leaflet Map:

Building maps in Next.js comes with a catch --
Leaflet is a "browser-only" library (it relies on the 
browser's window to render the map). Because Next.js 
tries to pre-render pages on the server before sending them 
to the browser, Leaflet will crash if you don't tell Next.js to wait.

The fix for this is using dynamic imports!
*/

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function Map() {
  //fix for standard Leaflet marker icons disappearing in Next.js !!
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  //default starting coordinates (Bethlehem, PA)
  const position = [40.6259, -75.3705];

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border-2 border-green-200">
      {/*NOTE: z-index is set to 0 so the auto-complete dropdown goes over the map, not under it! */}
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Bethlehem, PA <br /> Perfect weather for planting!
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}