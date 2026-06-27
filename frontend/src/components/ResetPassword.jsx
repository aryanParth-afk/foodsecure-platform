import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams(); // Grabs the secret token from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password: newPassword });
      toast.success(response.data.message);
      setTimeout(() => navigate('/auth?mode=login'), 2000); // Send them to login
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest ink-border soft-elevation p-8 rounded-xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>

        <div className="bg-surface-container w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto border border-outline-variant shadow-sm">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="font-display-lg text-3xl text-on-surface text-center mb-2 tracking-tight">Create New Password</h2>
        <p className="text-on-surface-variant text-center font-body-md text-sm mb-8">Enter your new secure password below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Lock className="w-5 h-5 text-on-surface-variant absolute left-4 top-3.5 group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg py-3 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm" 
              required
              minLength="6"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-70 mt-2">
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;