import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Building2, Calendar, TrendingUp, AlertCircle, KeyRound, Check, Trash2, History } from 'lucide-react';
import toast from 'react-hot-toast';

const DonorHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // Tabs: 'active' or 'picked_up'
  const [activeOtpInput, setActiveOtpInput] = useState({ id: null, code: '' });
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = String(currentUser._id || currentUser.id);
        const response = await axios.get(`${apiUrl}/api/my-donations/${userId}`);
        setDonations(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load history", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [apiUrl, currentUser.id, currentUser._id]);

  const handleVerifyPickup = async (listingId) => {
    if (activeOtpInput.code.length !== 4) return toast.error("OTP must be 4 digits");

    try {
      const response = await axios.patch(`${apiUrl}/api/listings/${listingId}/verify-pickup`, {
        otp: activeOtpInput.code
      });
      toast.success("Pickup verified successfully!");
      setActiveOtpInput({ id: null, code: '' });
      setDonations(donations.map(d => d._id === listingId ? response.data : d));
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  // NEW: Hide item from UI without deleting it from DB
  const handleHideListing = async (listingId) => {
    if (!window.confirm("Remove this from your visible history? Your total impact counters will NOT be affected.")) return;
    
    try {
      await axios.patch(`${apiUrl}/api/listings/${listingId}/hide-donor`);
      toast.success("Removed from history log");
      setDonations(donations.map(d => d._id === listingId ? { ...d, donorHidden: true } : d));
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // STATS CALCULATION (Uses ALL data, even hidden ones, to keep counters accurate)
  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status.toLowerCase() === 'completed').length;
  const activeDonationsCount = donations.filter(d => d.status.toLowerCase() === 'available' || d.status.toLowerCase() === 'claimed').length;

  // DISPLAY LOGIC (Only shows items that are NOT hidden)
  const visibleDonations = donations.filter(d => !d.donorHidden);
  
  // Split into buckets
  const activeList = visibleDonations.filter(d => d.status.toLowerCase() !== 'completed');
  const pickedUpList = visibleDonations.filter(d => d.status.toLowerCase() === 'completed');

  // Helper function to group items by Date
  const groupDonationsByDate = (list, dateField) => {
    const grouped = {};
    list.forEach(item => {
      const dateStr = new Date(item[dateField]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(item);
    });
    // Return array sorted by newest date first
    return Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).map(date => ({ date, items: grouped[date] }));
  };

  // Active items grouped by Posted Date (createdAt)
  const groupedActive = groupDonationsByDate(activeList, 'createdAt');
  
  // Picked Up items grouped by Pickup Date (updatedAt)
  const groupedPickedUp = groupDonationsByDate(pickedUpList, 'updatedAt');

  const displayedGroups = activeTab === 'active' ? groupedActive : groupedPickedUp;

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Impact History</h1>
        <p className="text-slate-500 font-medium mt-1">Track your donations and verify NGO pickups.</p>
      </motion.div>

      {/* Persistent Stats Bar */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><TrendingUp className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Posts</p><p className="text-3xl font-black text-slate-900">{totalDonations}</p></div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><CheckCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rescued Successfully</p><p className="text-3xl font-black text-slate-900">{completedDonations}</p></div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><AlertCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active / Pending</p><p className="text-3xl font-black text-slate-900">{activeDonationsCount}</p></div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex shadow-inner border border-slate-200/60">
          <button onClick={() => setActiveTab('active')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Clock className={`w-4 h-4 mr-2 ${activeTab === 'active' ? 'text-orange-500' : ''}`} />
            Active & Pending
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'}`}>{activeList.length}</span>
          </button>
          <button onClick={() => setActiveTab('picked_up')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'picked_up' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <History className={`w-4 h-4 mr-2 ${activeTab === 'picked_up' ? 'text-emerald-500' : ''}`} />
            Picked Up History
          </button>
        </div>
      </div>

      <motion.div layout className="space-y-8">
        <AnimatePresence mode="popLayout">
          {displayedGroups.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No {activeTab === 'active' ? 'active donations' : 'picked up items'}</h3>
              <p className="text-slate-500">{activeTab === 'active' ? 'When you post surplus food, it will appear here.' : 'Verified pickups will be saved here.'}</p>
            </motion.div>
          ) : (
            displayedGroups.map((group) => (
              <motion.div key={group.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
                
                {/* Beautiful Date Divider */}
                <div className="flex items-center space-x-4 mb-4 pl-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> {group.date}
                  </span>
                  <div className="h-px bg-slate-200 flex-3"></div>
                </div>

                <div className="space-y-4">
                  {group.items.map((donation) => (
                    <motion.div layout key={donation._id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6 pl-6">
                      
                      <div className={`absolute left-0 top-0 w-1.5 h-full transition-colors ${
                        donation.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                        donation.status.toLowerCase() === 'claimed' ? 'bg-blue-500' : 'bg-orange-400'
                      }`}></div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-black text-slate-900">{donation.foodItem || donation.foodName || 'Surplus Food'}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            donation.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            donation.status.toLowerCase() === 'claimed' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {donation.status.toLowerCase() === 'available' ? 'Pending Claim' : donation.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium flex items-center"><Package className="w-4 h-4 mr-1.5" /> Quantity: {donation.quantity}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl md:min-w-70 border border-slate-100 relative">
                        {/* THE DUSTBIN BUTTON (Only on Completed items) */}
                        {donation.status.toLowerCase() === 'completed' && (
                          <button 
                            onClick={() => handleHideListing(donation._id)}
                            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pickup Status</p>
                        
                        {donation.status.toLowerCase() === 'completed' ? (
                          <div className="flex items-center space-x-3 text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100 pr-10">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <div>
                              <span className="font-bold block text-sm">Verified & Picked Up</span>
                              <span className="text-xs font-medium text-emerald-600/70">by {donation.claimedBy?.orgName || 'NGO'}</span>
                            </div>
                          </div>
                        ) : donation.status.toLowerCase() === 'claimed' && donation.claimedBy ? (
                          <div>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-white p-2 rounded-xl shadow-sm"><Building2 className="w-5 h-5 text-blue-500" /></div>
                              <span className="font-bold text-slate-800">{donation.claimedBy.orgName || 'NGO Partner'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input 
                                  type="text" maxLength="4" placeholder="Enter OTP" 
                                  value={activeOtpInput.id === donation._id ? activeOtpInput.code : ''}
                                  onChange={(e) => setActiveOtpInput({ id: donation._id, code: e.target.value.replace(/\D/g, '') })}
                                  className="w-full bg-white border border-slate-200 text-sm font-bold rounded-xl py-2 pl-9 pr-3 focus:border-blue-500 focus:ring-1 outline-none transition-all"
                                />
                              </div>
                              <button onClick={() => handleVerifyPickup(donation._id)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm">
                                <Check className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium text-sm">Waiting for an NGO...</span>
                          </div>
                        )}
                      </div>

                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DonorHistory;