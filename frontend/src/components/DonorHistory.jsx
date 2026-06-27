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

  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status.toLowerCase() === 'completed').length;
  const activeDonationsCount = donations.filter(d => d.status.toLowerCase() === 'available' || d.status.toLowerCase() === 'claimed').length;

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 overflow-hidden pt-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
        <h1 className="font-display-lg text-4xl text-on-surface tracking-tight">Your Impact History</h1>
        <p className="font-body-md text-on-surface-variant mt-1">Track your donations and verify NGO pickups.</p>
      </motion.div>

      {/* Persistent Stats Bar */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest ink-border soft-elevation rounded-xl p-6 flex items-center space-x-4">
          <div className="bg-primary-container p-4 rounded-xl text-on-primary-container"><TrendingUp className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Total Posts</p><p className="font-headline-lg text-3xl text-on-surface">{totalDonations}</p></div>
        </div>
        <div className="bg-surface-container-lowest ink-border soft-elevation rounded-xl p-6 flex items-center space-x-4">
          <div className="bg-secondary p-4 rounded-xl text-on-secondary"><CheckCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Rescued</p><p className="font-headline-lg text-3xl text-on-surface">{completedDonations}</p></div>
        </div>
        <div className="bg-surface-container-lowest ink-border soft-elevation rounded-xl p-6 flex items-center space-x-4">
          <div className="bg-surface-tint p-4 rounded-xl text-on-primary"><AlertCircle className="w-8 h-8" /></div>
          <div><p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Active</p><p className="font-headline-lg text-3xl text-on-surface">{activeDonationsCount}</p></div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-surface-container p-1.5 rounded-xl inline-flex border border-outline-variant">
          <button onClick={() => setActiveTab('active')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <Clock className={`w-4 h-4 mr-2 ${activeTab === 'active' ? 'text-primary' : ''}`} />
            Active & Pending
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-bright text-on-surface-variant'}`}>{activeList.length}</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <History className={`w-4 h-4 mr-2 ${activeTab === 'history' ? 'text-secondary' : ''}`} />
            Past History
          </button>
        </div>
      </div>

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
              <div className="bg-surface-bright border border-dashed border-outline-variant rounded-xl p-12 text-center">
                <Package className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                <h3 className="text-base font-bold text-on-surface">No {activeTab === 'active' ? 'active donations' : 'past items'}</h3>
                <p className="text-sm text-on-surface-variant">{activeTab === 'active' ? 'When you post surplus food, it will appear here.' : 'Completed and expired items will be saved here.'}</p>
              </div>
            ) : (
              displayedGroups.map((group) => (
                <div key={group.date} className="mb-6">
                  <div className="mb-4">
                    <h2 className="font-headline-sm text-xl text-on-surface flex items-center mb-1">
                      <Calendar className="w-5 h-5 mr-2 text-primary" /> {group.date}
                    </h2>
                    <div className="h-0.5 w-16 bg-primary rounded-full"></div>
                  </div>

                  <div className="relative pl-4 md:pl-8">
                    <div className="absolute left-[7px] md:left-[15px] top-4 bottom-0 w-0.5 bg-outline-variant rounded-full"></div>

                    <div className="space-y-4">
                      {group.items.map((donation) => (
                        <motion.div 
                          key={donation._id} 
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          className="bg-surface-container-lowest ink-border hover:soft-elevation rounded-xl relative flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6 group transition-all"
                        >
                          <div className={`absolute left-0 top-0 w-1 h-full rounded-l-xl transition-colors ${
                            donation.status.toLowerCase() === 'completed' ? 'bg-secondary' :
                            donation.status.toLowerCase() === 'expired' ? 'bg-tertiary' :
                            donation.status.toLowerCase() === 'claimed' ? 'bg-primary-container' : 'bg-primary'
                          }`}></div>

                          <div className="flex-1 py-5">
                            <div className="flex items-center space-x-3 mb-1.5">
                              <h3 className="font-headline-sm text-lg text-on-surface">{donation.foodItem || donation.foodName || 'Surplus Food'}</h3>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                donation.status.toLowerCase() === 'completed' ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed-dim' :
                                donation.status.toLowerCase() === 'expired' ? 'bg-surface-variant text-on-surface-variant border-outline-variant' :
                                donation.status.toLowerCase() === 'claimed' ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary-fixed-dim' : 'bg-error-container text-on-error-container border-error'
                              }`}>
                                {donation.status.toLowerCase() === 'available' ? 'Pending Claim' : donation.status}
                              </span>
                            </div>
                            <p className="text-on-surface-variant font-medium text-sm flex items-center"><Package className="w-4 h-4 mr-1.5" /> Quantity: {donation.quantity}</p>
                          </div>

                          <div className="bg-surface-container p-4 rounded-r-xl md:min-w-65 border-l border-outline-variant relative h-full flex flex-col justify-center min-h-[100px]">
                            {['completed', 'expired'].includes(donation.status.toLowerCase()) && (
                              <button 
                                onClick={() => handleHideListing(donation._id)}
                                className="absolute top-2 right-2 p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors"
                                title="Remove from history"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Pickup Status</p>
                            
                            {donation.status.toLowerCase() === 'completed' ? (
                              <div className="flex items-center space-x-2.5 text-on-secondary-fixed-variant bg-secondary-fixed p-2 rounded border border-secondary-fixed-dim pr-10">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <div className="leading-tight">
                                  <span className="font-bold block text-sm">Verified & Picked Up</span>
                                  <span className="text-[10px] font-medium text-on-secondary-fixed-variant/70">by {donation.claimedBy?.orgName || 'NGO'}</span>
                                </div>
                              </div>
                            ) : donation.status.toLowerCase() === 'expired' ? (
                              <div className="flex items-center space-x-2.5 text-on-surface-variant bg-surface-variant p-2 rounded border border-outline-variant pr-10">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <div className="leading-tight">
                                  <span className="font-bold block text-sm">Expired</span>
                                  <span className="text-[10px] font-medium">Not picked up in time</span>
                                </div>
                              </div>
                            ) : donation.status.toLowerCase() === 'claimed' && donation.claimedBy ? (
                              <div>
                                <div className="flex items-center space-x-2.5 mb-2.5">
                                  <div className="bg-surface-bright p-1.5 rounded border border-outline-variant"><Building2 className="w-4 h-4 text-primary" /></div>
                                  <span className="font-bold text-sm text-on-surface">{donation.claimedBy.orgName || 'NGO Partner'}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <div className="relative flex-1">
                                    <KeyRound className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-3" />
                                    <input 
                                      type="text" maxLength="4" placeholder="Enter OTP" 
                                      value={activeOtpInput.id === donation._id ? activeOtpInput.code : ''}
                                      onChange={(e) => setActiveOtpInput({ id: donation._id, code: e.target.value.replace(/\D/g, '') })}
                                      className="w-full bg-surface-bright border border-outline-variant text-sm font-mono font-black tracking-widest text-on-surface rounded py-2 pl-9 pr-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
                                    />
                                  </div>
                                  <button onClick={() => handleVerifyPickup(donation._id)} className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary py-2 px-3 rounded transition-colors w-auto min-w-10 flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-2.5">
                                <div className="flex items-center space-x-2 text-on-surface-variant pb-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium text-sm">Waiting for an NGO...</span>
                                </div>
                                
                                <button 
                                  onClick={() => handleDelete(donation._id, donation.foodItem || donation.foodName)}
                                  className="flex items-center justify-center gap-1.5 w-full bg-error-container border border-error text-on-error-container hover:bg-error hover:text-on-error rounded py-1.5 text-xs font-bold transition-all shadow-sm mt-1"
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