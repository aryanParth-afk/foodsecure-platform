import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, MapPin, Clock, XCircle, KeyRound, CheckCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to toggle between active pickups and completed history
  const [activeTab, setActiveTab] = useState('active'); 
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchClaims = async () => {
      if (!currentUser.id) return;
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/my-claims/${currentUser.id}`);
        setClaims(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claims:", error);
        toast.error("Could not load your claims.");
        setLoading(false);
      }
    };
    fetchClaims();
  }, [apiUrl, currentUser.id]);

  const handleCancel = async (id) => {
    try {
      await axios.patch(`${apiUrl}/api/listings/${id}/cancel`);
      toast.success("Claim canceled. Item returned to Live Feed.");
      setClaims(claims.filter(c => c._id !== id));
    } catch (error) {
      console.error("Error canceling claim:", error);
      toast.error("Failed to cancel claim.");
    }
  };

  // NEW: Filter the claims into two separate buckets!
  const activeClaims = claims.filter(c => c.status.toLowerCase() === 'claimed');
  const pastClaims = claims.filter(c => c.status.toLowerCase() === 'completed');
  
  // Decide which bucket to show based on the active tab
  const displayedClaims = activeTab === 'active' ? activeClaims : pastClaims;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, show: { opacity: 1, scale: 1, y: 0 } };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-4"></div>
        <p className="text-slate-400 font-medium">Fetching your records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* NEW: Sleek Tab Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex shadow-inner border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 mr-2 ${activeTab === 'active' ? 'text-orange-500' : ''}`} />
            Active Pickups
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'}`}>
              {activeClaims.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className={`w-4 h-4 mr-2 ${activeTab === 'history' ? 'text-blue-500' : ''}`} />
            Past Rescues
          </button>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          
          {displayedClaims.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'active' ? <Package className="w-10 h-10 text-slate-300" /> : <CheckCircle className="w-10 h-10 text-slate-300" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {activeTab === 'active' ? 'No active pickups!' : 'No completed rescues yet.'}
              </h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                {activeTab === 'active' 
                  ? 'Items you claim from the Live Feed will appear here.' 
                  : 'Once a donor verifies your pickup PIN, the record will be saved here.'}
              </p>
            </motion.div>
          ) : (
            displayedClaims.map((claim) => (
              <motion.div layout variants={cardVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }} key={claim._id} 
                className={`border-2 rounded-4xl p-6 relative overflow-hidden group transition-all shadow-sm flex flex-col ${
                  claim.status.toLowerCase() === 'completed' ? 'bg-slate-50 border-emerald-100/50' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                
                {/* Header Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    claim.status.toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {claim.quantity}
                  </span>
                  
                  {claim.status.toLowerCase() === 'completed' ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center">
                      Pending Pickup
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2">{claim.foodName}</h3>
                
                {/* Donor Info */}
                {claim.donorId && (
                  <div className="mb-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Donated By</p>
                    <p className="font-bold text-slate-800">{claim.donorId.orgName || 'Local Partner'}</p>
                  </div>
                )}
                
                <div className="space-y-2 mb-6 grow">
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <MapPin className={`w-4 h-4 mr-2 shrink-0 ${claim.status.toLowerCase() === 'completed' ? 'text-emerald-400' : 'text-orange-400'}`} />
                    <span className="truncate">{claim.pickupLocation}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <Clock className={`w-4 h-4 mr-2 shrink-0 ${claim.status.toLowerCase() === 'completed' ? 'text-emerald-400' : 'text-orange-400'}`} />
                    <span>{claim.status.toLowerCase() === 'completed' ? `Rescued on ${new Date(claim.updatedAt).toLocaleDateString()}` : (claim.availableSlots && claim.availableSlots.length > 0 ? claim.availableSlots[0] : 'Contact donor for time')}</span>
                  </div>
                </div>

                {/* ONLY SHOW OTP & CANCEL BUTTON IF STATUS IS ACTIVE */}
                {claim.status.toLowerCase() === 'claimed' && (
                  <>
                    {claim.pickupOtp && (
                      <div className="mb-4 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                          <div className="flex items-center text-orange-600 mb-1">
                            <KeyRound className="w-4 h-4 mr-1.5" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Pickup PIN</p>
                          </div>
                          <p className="text-xs font-medium text-orange-800/80">Give this to the donor.</p>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm">
                          <span className="text-xl font-black text-slate-900 tracking-widest">{claim.pickupOtp}</span>
                        </div>
                      </div>
                    )}

                    <button onClick={() => handleCancel(claim._id)} className="w-full bg-white border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200 text-rose-500 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Claim</span>
                    </button>
                  </>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MyClaims;