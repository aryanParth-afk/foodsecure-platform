import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import toast from 'react-hot-toast';
import { Navigation, MapPin, Package, Navigation2, Clock } from 'lucide-react';
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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
};

const NgoMapDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoLocation, setNgoLocation] = useState(null); 
  const [mapCenter, setMapCenter] = useState([25.5941, 85.1376]);

  // Grab the current user
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const referenceLocation = ngoLocation || mapCenter;
  
  const sortedListings = [...listings].map(listing => {
    let distance = Infinity;
    if (listing.lat && listing.lng && referenceLocation) {
      distance = calculateDistance(referenceLocation[0], referenceLocation[1], listing.lat, listing.lng);
    }
    return { ...listing, distance };
  }).sort((a, b) => a.distance - b.distance);

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-4 md:py-8 flex flex-col h-full pt-32">
      
      <div className="mb-4 px-2 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-4xl text-on-surface">Live Rescue Map</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            Tap the green pin to find your location. View closest donations in the sidebar.
          </p>
        </div>
        
        <button 
          onClick={locateNGO}
          className="hidden md:flex items-center gap-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high text-on-surface px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Navigation className="w-4 h-4 text-primary" /> Re-center on Me
        </button>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-auto lg:h-[75vh] w-full">
        
        {/* SIDEBAR */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm h-[40vh] lg:h-full shrink-0">
          <div className="p-4 bg-surface-container-high border-b border-outline-variant font-bold text-on-surface flex justify-between items-center">
            <span>Nearby Donations</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-bold">{sortedListings.length} Total</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {sortedListings.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm mt-10">No active donations nearby.</p>
            ) : (
              sortedListings.map(listing => (
                <div 
                  key={listing._id} 
                  onClick={() => setMapCenter([listing.lat, listing.lng])}
                  className="bg-surface-bright border border-outline-variant hover:border-primary p-4 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{listing.foodName}</h4>
                    {listing.distance !== Infinity && (
                      <span className="text-[10px] font-black tracking-widest uppercase text-secondary bg-secondary/10 px-2 py-1 rounded shrink-0 ml-2">
                        {listing.distance.toFixed(1)} mi
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-xs mb-2 flex items-center gap-1.5 font-medium">
                    <Package className="w-3.5 h-3.5 text-outline" /> <strong>{listing.quantity}</strong>
                  </p>
                  <p className="text-on-surface-variant text-xs mb-3 leading-tight line-clamp-2 flex items-start gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-outline mt-0.5" /> {listing.pickupLocation}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClaim(listing._id, listing.foodName); }}
                    className="bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider py-2 w-full rounded hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    Claim Pickup
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-2 ink-border soft-elevation rounded-xl relative z-0 h-[50vh] lg:h-full w-full shrink-0">
        
        <button 
          onClick={locateNGO}
          className="md:hidden absolute bottom-6 right-4 z-[400] bg-surface-bright border border-outline-variant text-primary p-3 rounded-full shadow-lg hover:bg-surface-container active:scale-95 transition-all"
        >
          <Navigation2 className="w-6 h-6 fill-primary/20" />
        </button>

        <div className="w-full h-full rounded-lg overflow-hidden border border-outline-variant/30">
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
                    <div className="p-1 font-bold text-secondary text-center text-sm">📍 You are here</div>
                  </Popup>
                </Marker>
                <Circle center={ngoLocation} radius={2000} pathOptions={{ color: '#505f7a', fillColor: '#505f7a', fillOpacity: 0.1, weight: 1 }} />
              </>
            )}
            
            {listings.map((listing) => {
              if (!listing.lat || !listing.lng) return null;
              return (
                <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                  <Popup className="custom-popup">
                    <div className="p-3 min-w-48 bg-surface-bright rounded-lg border border-outline-variant">
                      <h4 className="font-headline-sm text-on-surface text-sm md:text-base mb-1">{listing.foodName}</h4>
                      <p className="text-on-surface-variant text-[11px] md:text-xs mb-1 flex items-center gap-1 font-medium">
                        <Package className="w-3 h-3 text-outline" /> <strong>{listing.quantity}</strong>
                      </p>
                      <p className="text-on-surface-variant text-[10px] mb-3 leading-tight line-clamp-2 flex items-start gap-1 font-medium">
                        <MapPin className="w-3 h-3 shrink-0 text-outline mt-0.5" /> {listing.pickupLocation}
                      </p>
                      {listing.expiresAt && (
                        <p className="text-error text-[10px] mb-3 leading-tight flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3 shrink-0" /> Expires {new Date(listing.expiresAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      <button 
                        onClick={() => handleClaim(listing._id, listing.foodName)}
                        className="bg-primary text-on-primary font-label-sm uppercase tracking-wider py-2 w-full rounded hover:bg-on-primary-fixed-variant transition-colors"
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
      </div>
    </div>
  );
};

export default NgoMapDashboard;