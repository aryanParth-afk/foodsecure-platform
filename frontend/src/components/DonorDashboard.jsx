import React, { useState } from 'react';
import axios from 'axios'; // ADDED: To talk to the backend
import toast from 'react-hot-toast';
import { HeartHandshake, PackageOpen, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const DonorDashboard = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({ foodType: '', quantity: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); // ADDED: To show loading state

  // ADDED: Your live backend URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Send the real data to your Render backend and MongoDB
      await axios.post(`${apiUrl}/api/listings`, {
        donorId: currentUser.id,           // Pulls the logged-in user's ID
        foodName: formData.foodType,       // Matches your backend schema
        quantity: formData.quantity,       // Matches your backend schema
        pickupLocation: formData.address   // Matches your backend schema
      });

      // 2. Show success and clear the form
      toast.success("Donation successfully posted to the network!");
      setFormData({ foodType: '', quantity: '', address: '' });
    } catch (error) {
      console.error("Error posting donation:", error);
      toast.error("Failed to post donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-10">
        <div className="bg-emerald-100 p-3 rounded-2xl shadow-sm">
          <HeartHandshake className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Donor Portal</h1>
          <p className="text-gray-500 font-medium mt-1">Thank you, {currentUser.orgName || 'Partner'}. Post surplus food to the network.</p>
        </div>
      </motion.div>

      {/* Animated Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="bg-white border-2 border-gray-100 rounded-4xl p-8 sm:p-10 shadow-2xl shadow-emerald-900/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-400 to-teal-500"></div>

        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
          <PackageOpen className="w-6 h-6 mr-2 text-emerald-500" /> List New Donation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">What are you donating?</label>
              <input 
                type="text" required value={formData.foodType} onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 px-4 focus:bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all font-medium" 
                placeholder="e.g. 5 Trays of Sandwiches"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Estimated Quantity/Weight</label>
              <input 
                type="text" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 px-4 focus:bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all font-medium" 
                placeholder="e.g. 20 lbs or 50 servings"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Pickup Location / Address</label>
            <div className="relative group">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 pl-11 pr-4 focus:bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all font-medium" 
                placeholder="Where should the NGO pick this up?"
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
            className={`w-full text-white font-black text-lg py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 mt-4 ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
          >
            <span>{isSubmitting ? 'Posting...' : 'Post Donation to Network'}</span>
            {!isSubmitting && <Send className="w-5 h-5" />}
          </motion.button>
        </form>
      </motion.div>

    </div>
  );
};

export default DonorDashboard;