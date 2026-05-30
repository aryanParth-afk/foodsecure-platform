import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for React-Leaflet's default icon missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to make the map smoothly fly to a new location
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
};

const LocationPicker = ({ onConfirm, onCancel }) => {
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default to Delhi
  const [address, setAddress] = useState("Fetching location...");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const markerRef = useRef(null);

  // Free Reverse Geocoding (Coordinates -> Address)
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      setAddress("Coordinates: " + lat.toFixed(4) + ", " + lng.toFixed(4));
    }
  };

  // Free Forward Geocoding (Text -> Coordinates)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setAddress(display_name);
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch (error) {
      toast.error("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // Click map to drop pin
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Drag pin
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
    []
  );

  // GPS Locate feature
  const locateUser = () => {
    toast.loading("Finding your location...", { id: "gps" });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
          toast.success("Location found!", { id: "gps" });
        },
        () => {
          toast.error("GPS access denied. Please search manually.", { id: "gps" });
        }
      );
    }
  };

  // Run GPS once on load
  useEffect(() => {
    locateUser();
  }, []);

  return (
    <div className="flex flex-col h-125 w-full bg-white rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Top Controls: Search & GPS */}
      <div className="p-4 bg-white z-10 shadow-sm flex flex-col space-y-3 relative">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-black text-gray-800 text-lg">Select Pickup Point</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-rose-500 font-bold text-sm">Close</button>
        </div>
        
        <div className="flex space-x-2">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search city, street, or landmark..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-0 outline-none"
            />
          </form>
          <button 
            onClick={locateUser} type="button"
            className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
            title="Use my GPS"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 relative">
        <MapContainer center={position} zoom={14} scrollWheelZoom={true} className="h-full w-full z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController center={position} />
          <Marker position={position} draggable={true} eventHandlers={eventHandlers} ref={markerRef}>
            <Popup>Pickup Location</Popup>
          </Marker>
          <MapEvents />
        </MapContainer>
      </div>

      {/* Bottom Confirmation Bar */}
      <div className="p-4 bg-white z-10 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Selected Address:</p>
        <p className="text-sm font-medium text-gray-900 mb-4 line-clamp-2">{address}</p>
        <button 
          onClick={() => onConfirm(address)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-200"
        >
          <Check className="w-5 h-5" />
          <span>Confirm This Location</span>
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;