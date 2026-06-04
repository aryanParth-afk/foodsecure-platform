import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import toast from 'react-hot-toast';
import { Navigation, MapPin, Package } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Standard Food Marker Icon (Blue)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom NGO Marker Icon (Green) to show their live location
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper component to smoothly fly the map to the NGO's location
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const NgoMapDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoLocation, setNgoLocation] = useState(null); 
  const [mapCenter, setMapCenter] = useState([25.5941, 85.1376]); // Fallback center

  useEffect(() => {
    fetchActiveListings();
    locateNGO();
  }, []);

const fetchActiveListings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/foodlistings/active`);
      
      // ADD THIS ONE LINE:
      console.log("Raw Data from Backend:", response.data); 
      
      setListings(response.data);
    } catch (error) {
      toast.error("Failed to load map listings.");
    } finally {
      setLoading(false);
    }
  };

  // The new GPS Locator Function
  const locateNGO = () => {
    toast.loading("Finding your live location...", { id: 'gps' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setNgoLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); // Auto-center map on the NGO
          toast.success("Live location found! Showing nearby donations.", { id: 'gps' });
        },
        (error) => {
          console.error(error);
          toast.error("GPS access denied. Showing default map area.", { id: 'gps' });
        }
      );
    } else {
      toast.dismiss('gps');
    }
  };

  const handleClaim = async (listingId, foodName) => {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : { id: null };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/foodlistings/claim/${listingId}`, { ngoId: user.id });
      
      toast.success(`${foodName} claimed successfully! Check your dashboard.`);
      setListings(listings.filter(listing => listing._id !== listingId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to claim listing.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Live Rescue Map</h2>
          <p className="text-slate-500 font-medium mt-1">
            Real-time GPS tracking. Green pin shows your location, blue pins are nearby donations.
          </p>
        </div>
        
        <button 
          onClick={locateNGO}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
        >
          <Navigation className="w-4 h-4 text-emerald-600" />
          Re-center on Me
        </button>
      </div>
      
      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xl bg-slate-50 relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '550px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} />

          {/* Render the NGO's Live Location */}
          {ngoLocation && (
            <>
              <Marker position={ngoLocation} icon={ngoIcon}>
                <Popup className="custom-popup">
                  <div className="p-1 font-bold text-emerald-700 text-center">
                    📍 You are here
                  </div>
                </Popup>
              </Marker>
              <Circle 
                center={ngoLocation} 
                radius={2000} // 2km highlight radius
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1 }} 
              />
            </>
          )}
          
          {/* Render the Active Food Donations */}
          {listings.map((listing) => {
            // Safety check: Skip old items that don't have GPS coordinates
            if (!listing.lat || !listing.lng) return null;
            
            return (
              <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-40">
                    <h4 className="font-bold text-slate-900 text-base mb-1">{listing.foodName}</h4>
                    <p className="text-slate-600 text-xs mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Qty: <strong>{listing.quantity}</strong>
                    </p>
                    <p className="text-slate-500 text-[10px] mb-3 leading-tight line-clamp-2 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {listing.pickupLocation}
                    </p>
                    <button 
                      onClick={() => handleClaim(listing._id, listing.foodName)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                      Claim Pickup
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default NgoMapDashboard;