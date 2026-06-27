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
    <div className="max-w-3xl mx-auto px-4 py-12 pt-32">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="bg-surface-container w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant shadow-sm">
          <User className="w-10 h-10 text-on-surface-variant" />
        </div>
        <h1 className="font-display-lg text-4xl text-on-surface tracking-tight">Account Settings</h1>
        <p className="font-body-md text-on-surface-variant mt-1">Manage your organization profile and security.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest ink-border soft-elevation rounded-xl p-8">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* Read-Only Role Badge */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Account Type</label>
            <span className={`inline-block px-4 py-2 rounded text-[10px] font-black uppercase tracking-wider ${
              currentUser.role === 'SuperAdmin' ? 'bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary-fixed-dim' :
              currentUser.role === 'Admin' ? 'bg-primary-container text-on-primary-container border border-primary-fixed-dim' :
              currentUser.role === 'Donor' ? 'bg-tertiary-container text-on-tertiary-container border border-outline' : 'bg-surface-container text-on-surface border border-outline'
            }`}>
              {currentUser.role}
            </span>
          </div>

          {/* Org Name Input */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Organization Name</label>
            <div className="relative group">
              <Building2 className="w-5 h-5 text-on-surface-variant absolute left-4 top-3.5 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg py-3 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm" 
                required
              />
            </div>
          </div>

          {/* New Password Input */}
          <div className="pt-4 border-t border-outline-variant">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Update Password (Optional)</label>
            <div className="relative group">
              <Lock className="w-5 h-5 text-on-surface-variant absolute left-4 top-3.5 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                placeholder="Leave blank to keep current password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg py-3 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm" 
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-2 font-medium">Type a new password here only if you wish to change your current one.</p>
          </div>

          {/* SECURITY VERIFICATION BLOCK */}
          <div className="pt-6 mt-6 border-t border-dashed border-outline-variant">
            <div className="bg-error-container/20 border border-error/20 rounded-lg p-5">
              <div className="flex items-center space-x-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-error" />
                <label className="text-sm font-bold text-error">Authorize Changes</label>
              </div>
              <p className="text-xs text-error/80 mb-3 font-medium">To protect your account, please enter your current password to save these changes.</p>
              
              <div className="relative group">
                <KeyRound className="w-5 h-5 text-error absolute left-4 top-3.5" />
                <input 
                  type="password" 
                  placeholder="Enter current password..."
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-bright border border-error/50 text-on-surface rounded-lg py-3 pl-12 pr-4 focus:border-error focus:ring-1 focus:ring-error outline-none transition-all font-medium text-sm" 
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md uppercase tracking-widest py-4 rounded-lg transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
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