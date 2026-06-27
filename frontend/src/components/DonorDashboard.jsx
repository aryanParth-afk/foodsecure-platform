import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HeartHandshake, PackageOpen, MapPin, Send, Camera, X, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from './LocationPicker'; 

const getDefaultDateTime = () => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const DonorDashboard = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // 1. UPDATED: Added lat and lng to the initial state
  const [formData, setFormData] = useState({ 
    foodType: '', 
    quantity: '', 
    address: '',
    lat: null,
    lng: null,
    expiresAt: getDefaultDateTime()
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isMapOpen, setIsMapOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "foodrescue_preset"); 
    const cloudName = "dkzec2m8s"; 
    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
      return res.data.secure_url; 
    } catch (error) {
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 2. UPDATED: Validation now checks that map coordinates actually exist
    if (!formData.address || !formData.lat || !formData.lng) {
      return toast.error("Please drop a pin on the map for the pickup location!");
    }

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        toast.loading("Uploading image...", { id: "uploadToast" });
        imageUrl = await uploadToCloudinary(imageFile);
        toast.dismiss("uploadToast");
      }

      // 3. UPDATED: Explicitly packaging the coordinates into the payload
      const dataToSend = {
        donorId: currentUser.id,          
        foodName: formData.foodType,      
        quantity: formData.quantity,      
        pickupLocation: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        imageUrl: imageUrl,
        expiresAt: formData.expiresAt
      };

      console.log("🚀 SENDING THIS TO BACKEND:", dataToSend);

      await axios.post(`${apiUrl}/api/listings`, dataToSend);
      
      toast.success("Donation successfully posted to the network!");
      
      // Reset the form
      setFormData({ foodType: '', quantity: '', address: '', lat: null, lng: null, expiresAt: getDefaultDateTime() });
      setImageFile(null); 
    } catch (error) {
      toast.error("Failed to post donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      
      {/* THE MAP MODAL */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
            >
              <LocationPicker 
                onCancel={() => setIsMapOpen(false)}
                // 4. UPDATED: Capturing the selectedLat and selectedLng from the map widget
                onConfirm={(selectedAddress, selectedLat, selectedLng) => {
                  setFormData({
                    ...formData, 
                    address: selectedAddress,
                    lat: selectedLat,
                    lng: selectedLng
                  });
                  setIsMapOpen(false); 
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-10">
        <div className="bg-emerald-100 p-3 rounded-2xl shadow-sm">
          <HeartHandshake className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Donor Portal</h1>
          <p className="text-gray-500 font-medium mt-1">Thank you, {currentUser.orgName || 'Partner'}. Post surplus food to the network.</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="bg-white border-2 border-gray-100 rounded-4xl p-8 sm:p-10 shadow-2xl shadow-emerald-900/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-400 to-teal-500"></div>

        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
          <PackageOpen className="w-6 h-6 mr-2 text-emerald-500" /> List New Donation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">What are you donating?</label>
              <input type="text" required value={formData.foodType} onChange={(e) => setFormData({...formData, foodType: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 px-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="e.g. 5 Trays" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Quantity/Weight</label>
              <input type="text" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 px-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="e.g. 20 lbs" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Expires At</label>
              <input 
                type="datetime-local" 
                required 
                value={formData.expiresAt} 
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} 
                className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl py-3 px-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Pickup Location</label>
            
            {!formData.address ? (
              <button 
                type="button" 
                onClick={() => setIsMapOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 hover:bg-blue-100 hover:border-blue-300 py-4 rounded-xl font-bold transition-all"
              >
                <Map className="w-5 h-5" />
                <span>Choose pickup point from Map</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start justify-between">
                <div className="flex items-start space-x-3 pr-4">
                  <div className="mt-0.5"><MapPin className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">Confirmed Location</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{formData.address}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 shrink-0">
                  <button type="button" onClick={() => setIsMapOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm transition-colors">
                    Re-select
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, address: '', lat: null, lng: null})} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Photo of Food (Optional)</label>
            {!imageFile ? (
              <label className="flex items-center justify-center bg-gray-50 text-gray-600 px-4 py-8 rounded-xl border-2 border-dashed border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 cursor-pointer transition-all font-bold text-sm w-full">
                <Camera className="w-6 h-6 mr-3" /> Click to browse and upload a photo
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">{imageFile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ready to upload</p>
                </div>
                <button type="button" onClick={() => setImageFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"><X className="w-5 h-5" /></button>
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