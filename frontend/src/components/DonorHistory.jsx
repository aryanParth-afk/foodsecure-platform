import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Building2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const DonorHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch all listings and filter for this specific donor
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/listings`);
        const myDonations = response.data.filter(item => item.donorId?._id === currentUser.id || item.donorId === currentUser.id);
        
        // Sort by newest first
        setDonations(myDonations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
      } catch (error) {
        console.error("Failed to load history", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser.id]);

  // Calculate Impact Stats
  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const activeDonations = donations.filter(d => d.status === 'available').length;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Impact History</h1>
        <p className="text-slate-500 font-medium mt-1">Track your donations and see the difference you are making.</p>
      </motion.div>

      {/* Impact Stats Row */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Posts</p>
            <p className="text-3xl font-black text-slate-900">{totalDonations}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><CheckCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rescued Successfully</p>
            <p className="text-3xl font-black text-slate-900">{completedDonations}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/40 flex items-center space-x-4">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><AlertCircle className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Currently Active</p>
            <p className="text-3xl font-black text-slate-900">{activeDonations}</p>
          </div>
        </div>
      </motion.div>

      {/* Donation Timeline */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-emerald-500" /> Donation Log</h2>
        
        {donations.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No donations yet</h3>
            <p className="text-slate-500">When you post surplus food, it will appear here.</p>
          </div>
        ) : (
          donations.map((donation) => (
            <motion.div key={donation._id} variants={itemVariants} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              
              {/* Colored side indicator based on status */}
              <div className={`absolute left-0 top-0 w-1.5 h-full transition-colors ${
                donation.status === 'completed' ? 'bg-emerald-500' :
                donation.status === 'claimed' ? 'bg-blue-500' : 'bg-orange-400'
              }`}></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                
                {/* Food Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-black text-slate-900">{donation.foodName}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      donation.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      donation.status === 'claimed' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {donation.status === 'available' ? 'Pending Claim' : donation.status}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium flex items-center"><Package className="w-4 h-4 mr-1.5" /> Quantity: {donation.quantity}</p>
                  <p className="text-slate-400 text-sm flex items-center mt-1"><Calendar className="w-4 h-4 mr-1.5" /> Posted: {new Date(donation.createdAt).toLocaleDateString()}</p>
                </div>

                {/* NGO Information (If Claimed/Completed) */}
                <div className="bg-slate-50 p-4 rounded-2xl md:min-w-62.5 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claimed By</p>
                  {donation.claimedBy ? (
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm"><Building2 className="w-5 h-5 text-blue-500" /></div>
                      <span className="font-bold text-slate-800">{donation.claimedBy.orgName || 'NGO Partner'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-sm">Waiting for an NGO...</span>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default DonorHistory;