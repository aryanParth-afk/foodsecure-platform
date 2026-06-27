import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'claims'
  const [listings, setListings] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (activeTab === 'feed') fetchAvailableListings();
    else fetchMyClaims();
  }, [activeTab]);

  useEffect(() => {
    const socket = io(apiUrl);
    
    socket.on('newListing', (listing) => {
      // Only add if we're on the feed tab and it's not already in the list
      setListings((prev) => {
        if (prev.some(l => l._id === listing._id)) return prev;
        return [listing, ...prev];
      });
      toast('🔔 New food donation nearby!', { icon: '🍲' });
    });

    socket.on('listingClaimed', ({ listingId }) => {
      setListings((prev) => prev.filter(l => l._id !== listingId));
    });

    socket.on('listingDeleted', ({ listingId }) => {
      setListings((prev) => prev.filter(l => l._id !== listingId));
    });

    return () => socket.disconnect();
  }, [apiUrl]);

  const fetchAvailableListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/listings/available`);
      setListings(res.data);
    } catch (error) {
      toast.error("Failed to load live feed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClaims = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/my-claims/${user?.id || user?._id}`);
      setMyClaims(res.data);
    } catch (error) {
      toast.error("Failed to load your claims.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id, foodName) => {
    try {
      const ngoId = user?.id || user?._id;
      await axios.patch(`${apiUrl}/api/listings/${id}/claim`, { ngoId });
      toast.success(`Successfully claimed ${foodName}! Check your pickups tab.`);
      setListings(listings.filter(item => item._id !== id));
    } catch (error) {
      toast.error("Failed to claim this listing.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">NGO Dashboard</h2>
          <p className="text-slate-300 font-medium mt-1">Review available donations and manage your rescue routes.</p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex bg-black/20 p-1 rounded-xl w-full md:w-auto border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'feed' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'claims' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white'}`}
          >
            My Pickups
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
        </div>
      ) : activeTab === 'feed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-full glass-panel p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No food available right now</h3>
              <p className="text-slate-300 text-sm mt-1">Check back later or view the Live Map for updates.</p>
            </div>
          ) : (
            listings.map(listing => (
              <div key={listing._id} className="glass-panel glass-panel-hover p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-white line-clamp-1">{listing.foodName}</h3>
                  <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ml-2">
                    {listing.category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-sm text-slate-200 flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4 text-slate-400" /> {listing.quantity}
                  </p>
                  <p className="text-sm text-slate-200 flex items-start gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="line-clamp-2">{listing.pickupLocation}</span>
                  </p>
                  {listing.expiresAt && (
                    <p className="text-sm text-slate-200 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" /> 
                      <span className="text-orange-400 font-bold drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]">Expires: {new Date(listing.expiresAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => handleClaim(listing._id, listing.foodName)}
                  className="glass-btn mt-auto py-3.5"
                >
                  Claim & Rescue
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClaims.length === 0 ? (
            <div className="col-span-full glass-panel p-12 text-center">
              <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No pickups yet</h3>
              <p className="text-slate-300 text-sm mt-1">Go to the Live Feed to claim your first donation!</p>
            </div>
          ) : (
            myClaims.map(claim => (
              <div key={claim._id} className="glass-panel glass-panel-hover p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-white line-clamp-1">{claim.foodName}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ml-2 border ${claim.status === 'Completed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-sm text-slate-200 flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4 text-slate-400" /> {claim.quantity}
                  </p>
                  <p className="text-sm text-slate-200 flex items-start gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="line-clamp-2">{claim.pickupLocation}</span>
                  </p>
                </div>

                {claim.status === 'Claimed' && claim.pickupOtp && (
                  <div className="mt-auto bg-black/30 rounded-2xl p-4 border border-white/10 text-center backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Secret Pickup OTP</p>
                    <p className="text-2xl font-mono font-black text-emerald-400 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{claim.pickupOtp}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NGODashboard;