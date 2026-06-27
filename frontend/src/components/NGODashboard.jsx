import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Package, Clock, CheckCircle } from 'lucide-react';

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
          <h2 className="text-3xl font-black text-slate-900">NGO Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Review available donations and manage your rescue routes.</p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'claims' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Pickups
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
      ) : activeTab === 'feed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No food available right now</h3>
              <p className="text-slate-500 text-sm mt-1">Check back later or view the Live Map for updates.</p>
            </div>
          ) : (
            listings.map(listing => (
              <div key={listing._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{listing.foodName}</h3>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap ml-2">
                    {listing.category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4 text-slate-400" /> {listing.quantity}
                  </p>
                  <p className="text-sm text-slate-600 flex items-start gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="line-clamp-2">{listing.pickupLocation}</span>
                  </p>
                  {listing.expiresAt && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" /> 
                      <span className="text-orange-600 font-bold">Expires: {new Date(listing.expiresAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => handleClaim(listing._id, listing.foodName)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-auto"
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
            <div className="col-span-full bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No pickups yet</h3>
              <p className="text-slate-500 text-sm mt-1">Go to the Live Feed to claim your first donation!</p>
            </div>
          ) : (
            myClaims.map(claim => (
              <div key={claim._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col opacity-95">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{claim.foodName}</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap ml-2 ${claim.status === 'Completed' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4 text-slate-400" /> {claim.quantity}
                  </p>
                  <p className="text-sm text-slate-600 flex items-start gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="line-clamp-2">{claim.pickupLocation}</span>
                  </p>
                </div>

                {claim.status === 'Claimed' && claim.pickupOtp && (
                  <div className="mt-auto bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Secret Pickup OTP</p>
                    <p className="text-2xl font-black text-slate-900 tracking-[0.2em]">{claim.pickupOtp}</p>
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