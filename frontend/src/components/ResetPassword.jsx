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
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-4xl shadow-xl shadow-slate-200/50">
        
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Create New Password</h2>
        <p className="text-slate-500 text-center text-sm font-medium mb-8">Enter your new secure password below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 focus:bg-white outline-none font-bold" 
              required
              minLength="6"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200">
            {isSubmitting ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;