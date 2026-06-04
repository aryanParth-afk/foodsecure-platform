import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      const loadingToast = toast.loading("Finding address...");
      try {
        // FREE OpenStreetMap Reverse Geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        
        const address = data.display_name || "Custom Map Location";
        onSelect(address, lat, lng);
        toast.dismiss(loadingToast);
      } catch (error) {
        toast.dismiss(loadingToast);
        onSelect(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`, lat, lng);
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const LocationPicker = ({ onSelect }) => {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm relative z-0">
      <div className="bg-slate-100 p-2 text-xs font-bold text-slate-600 text-center border-b border-slate-300">
        Click anywhere on the map to set pickup location
      </div>
      <MapContainer 
        center={[23.2599, 77.4126]} // Default center (Bhopal)
        zoom={12} 
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onSelect} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;