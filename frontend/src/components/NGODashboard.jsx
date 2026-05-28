import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, MapPin, Clock, CheckCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import MyClaims from './MyClaims'; // Make sure this import is here!

const NGODashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // State for switching tabs
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDonations = async () => {
      // Simulating an API call for the frontend UI upgrade
      // Replace this with your actual backend endpoint later: axios.get(`${import.meta.env.VITE_API_URL}/api/listings/available`)
      setTimeout(() => {
        setDonations([
          { _id: '1', foodType: 'Fresh Bread & Pastries', quantity: '20 lbs', location: 'Downtown Bakery', time: '2 hours ago', status: 'Available' },
          { _id: '2', foodType: 'Assorted Vegetables', quantity: '50 lbs', location: 'Green Valley Grocery', time: '4 hours ago', status: 'Available' },
          { _id: '3', foodType: 'Catered Hot Meals', quantity: '30 servings', location: 'Corporate Events Co.', time: '1 hour ago', status: 'Available' },
        ]);
        setLoading(false);
      }, 800);
    };
    fetchDonations();
  }, []);

  const handleClaim = (id) => {
    toast.success("Donation successfully claimed!");
    setDonations(donations.filter(d => d._id !== id));
  };

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-hidden">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-2xl shadow-sm">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">NGO Operations</h1>
            <p className="text-gray-500 font-medium mt-1">Welcome back, {currentUser.orgName || 'Team'}. Manage your rescues below.</p>
          </div>
        </div>

        {/* Navigation Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'feed' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex-1 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'claims' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Claims
          </button>
        </div>
      </motion.div>

      {/* Conditionally render content based on activeTab */}
      {activeTab === 'feed' ? (
        loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold text-lg">No food donations available right now.</p>
              </div>
            ) : (
              donations.map((donation) => (
                <motion.div variants={cardVariants} key={donation._id} className="bg-white border-2 border-gray-100 rounded-4xl p-6 hover:border-orange-500 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 to-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                      {donation.quantity}
                    </span>
                    <span className="text-xs font-bold text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {donation.time}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-2">{donation.foodType}</h3>
                  
                  <div className="flex items-center text-gray-500 text-sm font-medium mb-6">
                    <MapPin className="w-4 h-4 mr-1.5 text-orange-400" />
                    {donation.location}
                  </div>

                  <button onClick={() => handleClaim(donation._id)} className="w-full bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Claim Donation</span>
                  </button>
                </motion.div>
              ))
            )}
          </motion.div>
        )
      ) : (
        /* Render the MyClaims component if the tab is switched */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <MyClaims />
        </motion.div>
      )}
    </div>
  );
};

export default NGODashboard;