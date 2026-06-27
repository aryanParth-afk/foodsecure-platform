import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import toast from 'react-hot-toast';
import { Navigation, MapPin, Package, Navigation2, ShieldAlert, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const NgoMapDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoLocation, setNgoLocation] = useState(null); 
  const [mapCenter, setMapCenter] = useState([25.5941, 85.1376]);

  // Grab the current user
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchActiveListings();
    locateNGO();
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const socket = io(apiUrl);
    
    socket.on('newListing', (listing) => {
      setListings((prev) => {
        if (prev.some(l => l._id === listing._id)) return prev;
        return [listing, ...prev];
      });
      toast('📍 New donation appeared on the map!', { icon: '🗺️' });
    });

    socket.on('listingClaimed', ({ listingId }) => {
      setListings((prev) => prev.filter(l => l._id !== listingId));
    });

    socket.on('listingDeleted', ({ listingId }) => {
      setListings((prev) => prev.filter(l => l._id !== listingId));
    });

    return () => socket.disconnect();
  }, []);

  const fetchActiveListings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/foodlistings/active`);
      setListings(response.data);
    } catch (error) {
      toast.error("Failed to load map listings.");
    } finally {
      setLoading(false);
    }
  };

  const locateNGO = () => {
    toast.loading("Finding your live location...", { id: 'gps' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setNgoLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); 
          toast.success("Location found!", { id: 'gps' });
        },
        (error) => {
          console.error(error);
          toast.error("GPS access denied.", { id: 'gps' });
        }
      );
    } else {
      toast.dismiss('gps');
    }
  };

  const handleClaim = async (listingId, foodName) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/foodlistings/claim/${listingId}`, { ngoId: user.id || user._id });
      
      toast.success(`${foodName} claimed! Check your dashboard.`);
      setListings(listings.filter(listing => listing._id !== listingId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to claim listing.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  // --- THE MAP ---
  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-4 md:py-8 flex flex-col h-full">
      
      <div className="mb-4 px-2 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Live Rescue Map</h2>
          <p className="text-slate-300 text-sm md:text-base font-medium mt-1">
            Tap the green pin to find your location. Blue pins are nearby donations.
          </p>
        </div>
        
        <button 
          onClick={locateNGO}
          className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm backdrop-blur-md"
        >
          <Navigation className="w-4 h-4 text-emerald-400" /> Re-center on Me
        </button>
      </div>
      
      <div className="glass-panel relative z-0 h-[70vh] md:h-150 w-full border-2 border-white/20">
        
        <button 
          onClick={locateNGO}
          className="md:hidden absolute bottom-6 right-4 z-400 bg-black/50 backdrop-blur-md border border-white/20 text-emerald-400 p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-black/70 active:scale-95 transition-all"
        >
          <Navigation2 className="w-6 h-6 fill-emerald-400/20" />
        </button>

        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />

          {ngoLocation && (
            <>
              <Marker position={ngoLocation} icon={ngoIcon}>
                <Popup className="custom-popup">
                  <div className="p-1 font-bold text-emerald-700 text-center text-sm">📍 You are here</div>
                </Popup>
              </Marker>
              <Circle center={ngoLocation} radius={2000} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1 }} />
            </>
          )}
          
          {listings.map((listing) => {
            if (!listing.lat || !listing.lng) return null;
            return (
              <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-40 bg-slate-900 rounded-xl">
                    <h4 className="font-bold text-white text-sm md:text-base mb-1">{listing.foodName}</h4>
                    <p className="text-slate-300 text-[11px] md:text-xs mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" /> <strong>{listing.quantity}</strong>
                    </p>
                    <p className="text-slate-400 text-[10px] mb-3 leading-tight line-clamp-2 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-slate-500" /> {listing.pickupLocation}
                    </p>
                    {listing.expiresAt && (
                      <p className="text-orange-400 text-[10px] mb-3 leading-tight flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3 shrink-0" /> Expires {new Date(listing.expiresAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    <button 
                      onClick={() => handleClaim(listing._id, listing.foodName)}
                      className="glass-btn py-2 text-xs"
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