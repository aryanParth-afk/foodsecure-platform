import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
// ADDED the 'X' icon for the remove button
import { HeartHandshake, PackageOpen, MapPin, Send, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';

const DonorDashboard = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({ foodType: '', quantity: '', address: '' });
  
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // --- CLOUDINARY UPLOAD FUNCTION ---
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "foodrescue_preset"); 
    const cloudName = "dkzec2m8s"; 

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
      return res.data.secure_url; 
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      
      if (imageFile) {
        toast.loading("Uploading image...", { id: "uploadToast" });
        imageUrl = await uploadToCloudinary(imageFile);
        toast.dismiss("uploadToast");
      }

      await axios.post(`${apiUrl}/api/listings`, {
        donorId: currentUser.id,           
        foodName: formData.foodType,       
        quantity: formData.quantity,       
        pickupLocation: formData.address,
        imageUrl: imageUrl 
      });

      toast.success("Donation successfully posted to the network!");
      setFormData({ foodType: '', quantity: '', address: '' });
      setImageFile(null); // Clears the image preview after success!
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

          {/* UPGRADED IMAGE UPLOAD FIELD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Photo of Food (Optional)</label>
            
            {/* Show standard upload button if NO image is selected */}
            {!imageFile ? (
              <label className="flex items-center justify-center bg-gray-50 text-gray-600 px-4 py-8 rounded-xl border-2 border-dashed border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 cursor-pointer transition-all font-bold text-sm w-full">
                <Camera className="w-6 h-6 mr-3" />
                Click to browse and upload a photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files[0])} 
                  className="hidden" 
                />
              </label>
            ) : (
              /* Show preview card if image IS selected */
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {/* 1. The Image Preview Thumbnail */}
                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
                
                {/* 2. File info and Remove Button */}
                <div className="ml-4 flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">{imageFile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ready to upload</p>
                </div>
                
                {/* 3. The Remove Button */}
                <button 
                  type="button" 
                  onClick={() => setImageFile(null)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex items-center justify-center shrink-0"
                  title="Remove photo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
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