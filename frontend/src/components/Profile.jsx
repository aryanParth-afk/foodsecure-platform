import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Lock, Building2, Save, KeyRound, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [orgName, setOrgName] = useState(currentUser.orgName || '');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      return toast.error("Please enter your current password to authorize changes.");
    }

    setIsSubmitting(true);

    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, {
        orgName: orgName !== currentUser.orgName ? orgName : undefined,
        newPassword: newPassword ? newPassword : undefined,
        currentPassword: currentPassword 
      });

      // LOGIC: Did they change their password?
      if (newPassword) {
        // Yes -> Log them out and redirect to Login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success("Password changed! Please log in again with your new password.", { duration: 4000 });
        navigate('/auth?mode=login');
      } else {
        // No -> Just update their name and refresh
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success("Profile updated successfully!");
        setCurrentPassword(''); 
        setTimeout(() => window.location.reload(), 1000);
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your organization profile and security.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-4xl p-8 shadow-xl shadow-slate-200/40">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* Read-Only Role Badge */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
            <span className={`inline-block px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${
              currentUser.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' :
              currentUser.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
              currentUser.role === 'Donor' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {currentUser.role}
            </span>
          </div>

          {/* Org Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Organization Name</label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input 
                type="text" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
                required
              />
            </div>
          </div>

          {/* New Password Input */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Password (Optional)</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input 
                type="password" 
                placeholder="Leave blank to keep current password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Type a new password here only if you wish to change your current one.</p>
          </div>

          {/* SECURITY VERIFICATION BLOCK */}
          <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-200">
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <label className="text-sm font-bold text-rose-900">Authorize Changes</label>
              </div>
              <p className="text-xs text-rose-700/80 mb-3 font-medium">To protect your account, please enter your current password to save these changes.</p>
              
              <div className="relative">
                <KeyRound className="w-5 h-5 text-rose-400 absolute left-4 top-3.5" />
                <input 
                  type="password" 
                  placeholder="Enter current password..."
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border-2 border-rose-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:border-rose-500 focus:ring-0 outline-none transition-all font-bold" 
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;