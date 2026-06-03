import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import toast from 'react-hot-toast';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Paste your real Mapbox public token here!
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const NgoMapDashboard = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch 'Available' listings from the backend
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

  // 2. Initialize the Map and paint markers
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.4126, 23.2599], // Default center (adjust to your target city)
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    listings.forEach((listing) => {
      // Skip if the donor didn't provide coordinates
      if (!listing.lng || !listing.lat) return;

      const popupHTML = `
        <div style="font-family: sans-serif; padding: 5px;">
          <h4 style="margin: 0 0 5px 0; color: #0f172a; font-weight: 800;">${listing.foodName}</h4>
          <p style="margin: 0 0 5px 0; color: #475569; font-size: 12px;">Quantity: <strong>${listing.quantity}</strong></p>
          <p style="margin: 0 0 10px 0; color: #475569; font-size: 12px;">📍 ${listing.pickupLocation}</p>
          <button 
            id="claim-btn-${listing._id}" 
            style="background-color: #0f172a; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; width: 100%;"
          >
            Claim Pickup
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      const marker = new mapboxgl.Marker({ color: '#f97316' }) 
        .setLngLat([listing.lng, listing.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      // Handle the Claim button click inside the popup
      popup.on('open', () => {
        const claimBtn = document.getElementById(`claim-btn-${listing._id}`);
        if (claimBtn) {
          claimBtn.addEventListener('click', async () => {
            try {
              await axios.post(`${import.meta.env.VITE_API_URL}/api/foodlistings/claim/${listing._id}`);
              toast.success(`${listing.foodName} claimed successfully!`);
              marker.remove(); 
              popup.remove();
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to claim listing.");
            }
          });
        }
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [listings, loading]);

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
      <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-100 bg-slate-50">
        <div ref={mapContainerRef} className="w-full h-137.5" />
      </div>
    </div>
  );
};

export default NgoMapDashboard;