import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, MapPin, Clock, XCircle, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Fetching your claimed rescues...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {claims.length === 0 ? (
        <div className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No claims yet!</h3>
          <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">Items you claim from the Live Feed will appear here for pickup.</p>
        </div>
      ) : (
        claims.map((claim) => (
          <motion.div variants={cardVariants} key={claim._id} className="bg-white border-2 border-gray-100 rounded-4xl p-6 relative overflow-hidden group hover:border-gray-200 transition-colors shadow-sm flex flex-col">
            
            <div className="flex justify-between items-start mb-4">
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {claim.quantity}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center">
                Ready for Pickup
              </span>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">{claim.foodName}</h3>
            
            {/* Donor Info */}
            {claim.donorId && (
              <div className="mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donated By</p>
                <p className="font-bold text-gray-800">{claim.donorId.orgName || 'Local Partner'}</p>
              </div>
            )}
            
            <div className="space-y-2 mb-6 grow">
              <div className="flex items-center text-gray-600 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span className="truncate">{claim.pickupLocation}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>{claim.availableSlots && claim.availableSlots.length > 0 ? claim.availableSlots[0] : 'Contact donor for time'}</span>
              </div>
            </div>

            {/* NEW: OTP Display Block */}
            {claim.pickupOtp && (
              <div className="mb-6 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center text-orange-600 mb-1">
                    <KeyRound className="w-4 h-4 mr-1.5" />
                    <p className="text-xs font-bold uppercase tracking-widest">Pickup PIN</p>
                  </div>
                  <p className="text-xs font-medium text-orange-800/80">Give this to the donor.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-orange-200 shadow-sm">
                  <span className="text-2xl font-black text-slate-900 tracking-widest">{claim.pickupOtp}</span>
                </div>
              </div>
            )}

            <button onClick={() => handleCancel(claim._id)} className="w-full bg-white border-2 border-red-100 hover:bg-red-50 hover:border-red-200 text-red-500 font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
              <XCircle className="w-5 h-5" />
              <span>Cancel Claim</span>
            </button>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default MyClaims;