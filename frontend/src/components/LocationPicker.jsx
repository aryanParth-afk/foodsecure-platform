import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for React-Leaflet's default icon missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
  // Default to a central location (e.g., New Delhi, India)
  const [position, setPosition] = useState([28.6139, 77.2090]);
  const [address, setAddress] = useState("Fetching location...");
  const markerRef = useRef(null);

  // Free Reverse Geocoding using OpenStreetMap (Nominatim API)
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        onLocationSelect(data.display_name); // Send address back to parent
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Coordinates: " + lat.toFixed(4) + ", " + lng.toFixed(4));
    }
  };

  // Click on the map to move the pin
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Drag the pin to move it
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          fetchAddress(lat, lng);
        }
      },
    }),
    [onLocationSelect]
  );

  // Try to get user's actual location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
        },
        () => {
          // Fallback to default if they deny location access
          fetchAddress(position[0], position[1]);
        }
      );
    }
  }, []);

  return (
    <div className="w-full border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm relative z-0">
      <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
        <span>📍 Click or drag the pin to set pickup point</span>
      </div>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-64 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={position} 
          draggable={true} 
          eventHandlers={eventHandlers} 
          ref={markerRef}
        >
          <Popup>{address}</Popup>
        </Marker>
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;