import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Package, CheckCircle, Truck, TrendingUp, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const NGODashboard = () => {
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchMyClaims();
  }, []);

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

  const activePickups = myClaims.filter(c => c.status === 'Claimed').length;
  const completedRescues = myClaims.filter(c => c.status === 'Completed').length;
  const totalItems = myClaims.length; 

  const handleNavigate = (claim) => {
    if (claim.lat && claim.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${claim.lat},${claim.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(claim.pickupLocation)}`, '_blank');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 pt-32">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-4xl text-on-surface tracking-tight">Command Center</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            Welcome back, {user?.orgName || 'Partner'}. Monitor your impact and manage your pickups.
          </p>
        </div>
        
        <Link 
          to="/ngo-map"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-on-primary-fixed-variant text-on-primary px-6 py-3 rounded-lg font-bold transition-all shadow-sm"
        >
          <Navigation className="w-5 h-5" /> Open Live Map
        </Link>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Pickups</p>
            <h3 className="text-4xl font-black text-primary">{activePickups}</h3>
          </div>
          <div className="p-4 bg-primary-container rounded-full">
            <Truck className="w-8 h-8 text-on-primary-container" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Completed Rescues</p>
            <h3 className="text-4xl font-black text-secondary">{completedRescues}</h3>
          </div>
          <div className="p-4 bg-secondary-container rounded-full">
            <CheckCircle className="w-8 h-8 text-on-secondary-container" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Items Rescued</p>
            <h3 className="text-4xl font-black text-tertiary">{totalItems}</h3>
          </div>
          <div className="p-4 bg-tertiary-container rounded-full">
            <TrendingUp className="w-8 h-8 text-on-tertiary-container" />
          </div>
        </div>
      </div>

      <div className="mb-6 border-b border-outline-variant pb-4">
        <h3 className="font-headline-sm text-2xl text-on-surface">Your Claimed Routes</h3>
        <p className="text-sm text-on-surface-variant font-medium mt-1">Donations you have claimed and need to pick up.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myClaims.length === 0 ? (
            <div className="col-span-full bg-surface-bright border border-dashed border-outline-variant p-12 text-center rounded-xl">
              <CheckCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <h3 className="font-headline-sm text-lg text-on-surface mb-1">No pickups yet</h3>
              <p className="text-on-surface-variant text-sm font-medium">Head over to the Live Map to claim your first donation!</p>
            </div>
          ) : (
            myClaims.map(claim => (
              <div key={claim._id} className="bg-surface-container-lowest ink-border hover:soft-elevation transition-all p-6 flex flex-col rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-headline-sm text-lg text-on-surface line-clamp-1">{claim.foodName}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ml-2 border ${claim.status === 'Completed' ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed-dim' : 'bg-primary-container text-on-primary-container border-primary-fixed-dim'}`}>
                    {claim.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-sm text-on-surface-variant flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4 text-outline" /> {claim.quantity}
                  </p>
                  <p className="text-sm text-on-surface-variant flex items-start gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-outline shrink-0 mt-0.5" /> 
                    <span className="line-clamp-2">{claim.pickupLocation}</span>
                  </p>
                </div>

                {claim.status === 'Claimed' && claim.pickupOtp && (
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="bg-surface-container border border-outline-variant rounded-lg p-4 text-center">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Secret Pickup OTP</p>
                      <p className="text-2xl font-mono font-black text-primary tracking-[0.2em]">{claim.pickupOtp}</p>
                    </div>
                    <button 
                      onClick={() => handleNavigate(claim)}
                      className="bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider py-3 w-full rounded hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" /> Start Navigation
                    </button>
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