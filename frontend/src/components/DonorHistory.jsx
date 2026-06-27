import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Building2, Calendar, TrendingUp, AlertCircle, KeyRound, Check, Trash2, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const DonorHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // Tabs: 'active' or 'history'
  const [activeOtpInput, setActiveOtpInput] = useState({ id: null, code: '' });
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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

  useEffect(() => {
    fetchHistory();
  }, [apiUrl, currentUser.id, currentUser._id]);

  useEffect(() => {
    const socket = io(apiUrl);
    
    socket.on('listingClaimed', () => {
      // Re-fetch to get populated NGO details and new status
      fetchHistory();
    });

    socket.on('listingCompleted', () => {
      fetchHistory();
    });

    return () => socket.disconnect();
  }, [apiUrl]);

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
  const activeList = visibleDonations.filter(d => ['available', 'claimed'].includes(d.status.toLowerCase()));
  const historyList = visibleDonations.filter(d => ['completed', 'expired'].includes(d.status.toLowerCase()));

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
  const groupedHistory = groupDonationsByDate(historyList, 'updatedAt');
  const displayedGroups = activeTab === 'active' ? groupedActive : groupedHistory;

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Your Impact History</h1>
        <p className="text-slate-300 font-medium mt-1">Track your donations and verify NGO pickups.</p>
      </motion.div>

      {/* Persistent Stats Bar */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400"><TrendingUp className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Posts</p><p className="text-3xl font-black text-white">{totalDonations}</p></div>
        </div>
        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-400"><CheckCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rescued Successfully</p><p className="text-3xl font-black text-white">{completedDonations}</p></div>
        </div>
        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="bg-orange-500/20 p-4 rounded-2xl text-orange-400"><AlertCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active / Pending</p><p className="text-3xl font-black text-white">{activeDonationsCount}</p></div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-black/30 p-1.5 rounded-2xl inline-flex border border-white/10 backdrop-blur-md">
          <button onClick={() => setActiveTab('active')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white'}`}>
            <Clock className={`w-4 h-4 mr-2 ${activeTab === 'active' ? 'text-orange-400' : ''}`} />
            Active & Pending
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-slate-300'}`}>{activeList.length}</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-white'}`}>
            <History className={`w-4 h-4 mr-2 ${activeTab === 'history' ? 'text-emerald-400' : ''}`} />
            Past History
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
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-inner">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No {activeTab === 'active' ? 'active donations' : 'past items'}</h3>
                <p className="text-sm text-slate-500">{activeTab === 'active' ? 'When you post surplus food, it will appear here.' : 'Completed and expired items will be saved here.'}</p>
              </div>
            ) : (
              displayedGroups.map((group) => (
                <div key={group.date} className="mb-6">
                  
                  {/* Date Divider */}
                  <div className="mb-4">
                  <h2 className="text-xl font-black text-white flex items-center mb-1">
                    <Calendar className="w-5 h-5 mr-2 text-emerald-400" /> {group.date}
                  </h2>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-400 to-transparent rounded-full"></div>
                </div>

                <div className="relative pl-4 md:pl-8">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] md:left-[15px] top-4 bottom-0 w-0.5 bg-white/10 rounded-full"></div>

                  {/* MORE COMPACT CARD DESIGN */}
                  <div className="space-y-3">
                    {group.items.map((donation) => (
                      <motion.div 
                        key={donation._id} 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="glass-panel glass-panel-hover relative flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6 group"
                      >
                        
                        {/* Thin Colored Edge Indicator */}
                        <div className={`absolute left-0 top-0 w-1 h-full transition-colors ${
                          donation.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                          donation.status.toLowerCase() === 'expired' ? 'bg-slate-400' :
                          donation.status.toLowerCase() === 'claimed' ? 'bg-blue-500' : 'bg-orange-400'
                        }`}></div>

                        <div className="flex-1 py-5">
                          <div className="flex items-center space-x-3 mb-1.5">
                            <h3 className="text-lg font-black text-white">{donation.foodItem || donation.foodName || 'Surplus Food'}</h3>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                              donation.status.toLowerCase() === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              donation.status.toLowerCase() === 'expired' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
                              donation.status.toLowerCase() === 'claimed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            }`}>
                              {donation.status.toLowerCase() === 'available' ? 'Pending Claim' : donation.status}
                            </span>
                          </div>
                          <p className="text-slate-300 font-medium text-sm flex items-center"><Package className="w-4 h-4 mr-1.5 text-slate-400" /> Quantity: {donation.quantity}</p>
                        </div>

                        <div className="bg-black/20 p-4 rounded-r-3xl md:min-w-65 border-l border-white/10 relative h-full flex flex-col justify-center min-h-[100px]">
                          {/* DUSTBIN BUTTON (For completed/expired history removal) */}
                          {['completed', 'expired'].includes(donation.status.toLowerCase()) && (
                            <button 
                              onClick={() => handleHideListing(donation._id)}
                              className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Remove from history"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pickup Status</p>
                          
                          {donation.status.toLowerCase() === 'completed' ? (
                            <div className="flex items-center space-x-2.5 text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 pr-10">
                              <CheckCircle className="w-4 h-4 shrink-0" />
                              <div className="leading-tight">
                                <span className="font-bold block text-sm text-emerald-300">Verified & Picked Up</span>
                                <span className="text-[10px] font-medium text-emerald-500">by {donation.claimedBy?.orgName || 'NGO'}</span>
                              </div>
                            </div>
                          ) : donation.status.toLowerCase() === 'expired' ? (
                            <div className="flex items-center space-x-2.5 text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700 pr-10">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <div className="leading-tight">
                                <span className="font-bold block text-sm text-slate-300">Expired</span>
                                <span className="text-[10px] font-medium text-slate-500">Not picked up in time</span>
                              </div>
                            </div>
                          ) : donation.status.toLowerCase() === 'claimed' && donation.claimedBy ? (
                            <div>
                              <div className="flex items-center space-x-2.5 mb-2.5">
                                <div className="bg-white/10 p-1.5 rounded-lg border border-white/10"><Building2 className="w-4 h-4 text-blue-400" /></div>
                                <span className="font-bold text-sm text-white">{donation.claimedBy.orgName || 'NGO Partner'}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                  <KeyRound className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-3" />
                                  <input 
                                    type="text" maxLength="4" placeholder="Enter OTP" 
                                    value={activeOtpInput.id === donation._id ? activeOtpInput.code : ''}
                                    onChange={(e) => setActiveOtpInput({ id: donation._id, code: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-black/40 border border-white/20 text-sm font-mono font-black tracking-widest text-emerald-400 rounded-xl py-2.5 pl-9 pr-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all placeholder:text-emerald-900"
                                  />
                                </div>
                                <button onClick={() => handleVerifyPickup(donation._id)} className="glass-btn py-2.5 px-3 w-auto min-w-10">
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
                                className="flex items-center justify-center gap-1.5 w-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm backdrop-blur-md mt-1"
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