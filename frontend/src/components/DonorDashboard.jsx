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

      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/donations`, { ...formData, image: imageUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Donation posted successfully!');
      
      setFormData({ 
        foodType: '', quantity: '', address: '', lat: null, lng: null, expiresAt: getDefaultDateTime() 
      });
      setImageFile(null);
    } catch (error) {
      toast.dismiss("uploadToast");
      toast.error('Failed to post donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-12 md:py-24 relative pt-32">
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-variant/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant"
            >
              <LocationPicker 
                onCancel={() => setIsMapOpen(false)}
                onConfirm={(selectedAddress, selectedLat, selectedLng) => {
                  setFormData({ ...formData, address: selectedAddress, lat: selectedLat, lng: selectedLng });
                  setIsMapOpen(false); 
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-10">
        <div className="bg-primary-container p-4 rounded-xl">
          <HeartHandshake className="w-8 h-8 text-on-primary-container" />
        </div>
        <div>
          <h1 className="font-display-lg text-4xl text-on-surface">Donor Portal</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Thank you, {currentUser.orgName || 'Partner'}. Post surplus food to the network.</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="bg-surface-container-lowest p-8 sm:p-10 relative ink-border soft-elevation rounded-xl"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary rounded-t-xl"></div>

        <h2 className="font-headline-sm text-2xl text-on-surface mb-8 flex items-center">
          <PackageOpen className="w-6 h-6 mr-2 text-primary" /> List New Donation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">What are you donating?</label>
              <input type="text" required value={formData.foodType} onChange={(e) => setFormData({...formData, foodType: e.target.value})} className="glass-input" placeholder="e.g. 5 Trays" />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Quantity/Weight</label>
              <input type="text" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="glass-input" placeholder="e.g. 20 lbs" />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Expires At</label>
              <input type="datetime-local" required value={formData.expiresAt} onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} className="glass-input appearance-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Pickup Location</label>
            {!formData.address ? (
              <button 
                type="button" 
                onClick={() => setIsMapOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-surface-container text-on-surface border border-dashed border-outline hover:bg-surface-container-high py-4 rounded-lg font-bold transition-all"
              >
                <Map className="w-5 h-5" />
                <span>Choose pickup point from Map</span>
              </button>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex items-start justify-between">
                <div className="flex items-start space-x-3 pr-4">
                  <div className="mt-0.5"><MapPin className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Confirmed Location</p>
                    <p className="text-sm font-medium text-on-surface line-clamp-2">{formData.address}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 shrink-0">
                  <button type="button" onClick={() => setIsMapOpen(true)} className="text-xs font-bold text-secondary hover:text-on-secondary hover:bg-secondary px-3 py-1.5 rounded border border-secondary transition-colors">
                    Re-select
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, address: '', lat: null, lng: null})} className="text-xs font-bold text-error hover:text-on-error hover:bg-error px-3 py-1.5 rounded border border-error transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Photo of Food (Optional)</label>
            {!imageFile ? (
              <label className="flex items-center justify-center bg-surface-container text-on-surface-variant px-4 py-8 rounded-lg border border-dashed border-outline hover:bg-surface-container-high cursor-pointer transition-all font-medium text-sm w-full">
                <Camera className="w-6 h-6 mr-3" /> Click to browse and upload a photo
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                <div className="h-16 w-16 rounded overflow-hidden border border-outline-variant shrink-0">
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-on-surface truncate">{imageFile.name}</p>
                  <p className="text-xs text-primary mt-0.5">Ready to upload</p>
                </div>
                <button type="button" onClick={() => setImageFile(null)} className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded transition-colors ml-2 shrink-0"><X className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
            className={isSubmitting ? 'glass-btn opacity-50 cursor-not-allowed' : 'glass-btn mt-6'}
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