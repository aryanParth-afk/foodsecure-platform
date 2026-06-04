import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const NgoMapDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveListings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/foodlistings/active`);
        setListings(response.data);
      } catch (error) {
        toast.error("Failed to load map listings.");
      } finally {
        setLoading(false);
      }
    };
    fetchActiveListings();
  }, []);

  const handleClaim = async (listingId, foodName) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/foodlistings/claim/${listingId}`);
      toast.success(`${foodName} claimed successfully!`);
      // Remove claimed listing from the map visually
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
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900">Live Rescue Map</h2>
        <p className="text-slate-500 font-medium mt-1">
          Browse visual pickup markers placed across the city to coordinate rescue routes.
        </p>
      </div>
      
      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xl bg-slate-50 relative z-0">
        <MapContainer 
          center={[23.2599, 77.4126]} // Default center (Bhopal)
          zoom={12} 
          style={{ height: '550px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {listings.map((listing) => {
            if (!listing.lat || !listing.lng) return null;
            
            return (
              <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-37.5">
                    <h4 className="font-bold text-slate-900 text-base mb-1">{listing.foodName}</h4>
                    <p className="text-slate-600 text-xs mb-1">Qty: <strong>{listing.quantity}</strong></p>
                    <p className="text-slate-500 text-[10px] mb-3 leading-tight line-clamp-2">{listing.pickupLocation}</p>
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