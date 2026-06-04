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

  // NEW: Delete active/pending donation
  const handleDelete = async (id, foodName) => {
    if (!window.confirm(`Are you sure you want to delete "${foodName}"? This will permanently remove it from the live map.`)) {
      return;
    }

    const toastId = toast.loading("Deleting donation...");
    try {
      await axios.delete(`${apiUrl}/api/listings/${id}`);
      setDonations(donations.filter(donation => donation._id !== id));
      toast.success("Donation removed successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete donation.", { id: toastId });
    }
  };

  // STATS CALCULATION
  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status.toLowerCase() === 'completed').length;
  const activeDonationsCount = donations.filter(d => d.status.toLowerCase() === 'available' || d.status.toLowerCase() === 'claimed').length;

  // DISPLAY LOGIC
  const visibleDonations = donations.filter(d => !d.donorHidden);
  const activeList = visibleDonations.filter(d => d.status.toLowerCase() !== 'completed');
  const pickedUpList = visibleDonations.filter(d => d.status.toLowerCase() === 'completed');

  const groupDonationsByDate = (list, dateField) => {
    const grouped = {};
    list.forEach(item => {
      const dateStr = new Date(item[dateField]).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(item);
    });
    return Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).map(date => ({ date, items: grouped[date] }));
  };

  const groupedActive = groupDonationsByDate(activeList, 'createdAt');
  const groupedPickedUp = groupDonationsByDate(pickedUpList, 'updatedAt');
  const displayedGroups = activeTab === 'active' ? groupedActive : groupedPickedUp;

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 overflow-hidden">
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
      <div className="flex justify-center mb-8 relative z-10">
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

      {/* THE SLEEK ANIMATION CONTAINER */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            {displayedGroups.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No {activeTab === 'active' ? 'active donations' : 'picked up items'}</h3>
                <p className="text-sm text-slate-500">{activeTab === 'active' ? 'When you post surplus food, it will appear here.' : 'Verified pickups will be saved here.'}</p>
              </div>
            ) : (
              displayedGroups.map((group) => (
                <div key={group.date} className="mb-6">
                  
                  {/* Date Divider */}
                  <div className="flex items-center space-x-4 mb-3 pl-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> {group.date}
                    </span>
                    <div className="h-px bg-slate-200 flex-3"></div>
                  </div>

                  {/* MORE COMPACT CARD DESIGN */}
                  <div className="space-y-3">
                    {group.items.map((donation) => (
                      <motion.div 
                        key={donation._id} 
                        layout="position" 
                        className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-4 pl-5"
                      >
                        
                        {/* Thin Colored Edge Indicator */}
                        <div className={`absolute left-0 top-0 w-1 h-full transition-colors ${
                          donation.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                          donation.status.toLowerCase() === 'claimed' ? 'bg-blue-500' : 'bg-orange-400'
                        }`}></div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1.5">
                            <h3 className="text-lg font-black text-slate-900">{donation.foodItem || donation.foodName || 'Surplus Food'}</h3>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              donation.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                              donation.status.toLowerCase() === 'claimed' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {donation.status.toLowerCase() === 'available' ? 'Pending Claim' : donation.status}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium text-sm flex items-center"><Package className="w-4 h-4 mr-1.5" /> Quantity: {donation.quantity}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl md:min-w-65 border border-slate-100 relative">
                          {/* DUSTBIN BUTTON (For completed history removal) */}
                          {donation.status.toLowerCase() === 'completed' && (
                            <button 
                              onClick={() => handleHideListing(donation._id)}
                              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove from history"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pickup Status</p>
                          
                          {donation.status.toLowerCase() === 'completed' ? (
                            <div className="flex items-center space-x-2.5 text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 pr-10">
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <div className="leading-tight">
                                <span className="font-bold block text-sm">Verified & Picked Up</span>
                                <span className="text-[10px] font-medium text-emerald-600/70">by {donation.claimedBy?.orgName || 'NGO'}</span>
                              </div>
                            </div>
                          ) : donation.status.toLowerCase() === 'claimed' && donation.claimedBy ? (
                            <div>
                              <div className="flex items-center space-x-2.5 mb-2.5">
                                <div className="bg-white p-1.5 rounded-lg shadow-sm"><Building2 className="w-4 h-4 text-blue-500" /></div>
                                <span className="font-bold text-sm text-slate-800">{donation.claimedBy.orgName || 'NGO Partner'}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                                  <input 
                                    type="text" maxLength="4" placeholder="Enter OTP" 
                                    value={activeOtpInput.id === donation._id ? activeOtpInput.code : ''}
                                    onChange={(e) => setActiveOtpInput({ id: donation._id, code: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-white border border-slate-200 text-sm font-bold rounded-lg py-1.5 pl-8 pr-2 focus:border-blue-500 focus:ring-1 outline-none transition-all"
                                  />
                                </div>
                                <button onClick={() => handleVerifyPickup(donation._id)} className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors shadow-sm">
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2.5">
                              <div className="flex items-center space-x-2 text-slate-400 pb-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium text-sm">Waiting for an NGO...</span>
                              </div>
                              
                              {/* NEW: Cancel & Delete button for Available/Pending donations */}
                              <button 
                                onClick={() => handleDelete(donation._id, donation.foodItem || donation.foodName)}
                                className="flex items-center justify-center gap-1.5 w-full bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Cancel & Delete
                              </button>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DonorHistory;