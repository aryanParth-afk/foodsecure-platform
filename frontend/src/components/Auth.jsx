import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, Building2, ArrowRight, KeyRound, ArrowLeft, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    orgName: '', 
    email: '', 
    phone: '',
    password: '', 
    role: 'NGO', // Defaults to NGO, but is instantly overwritten by the URL
    adminSecretCode: '' 
  });
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect if already logged in (prevents back-button bug)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        if (user.role === 'NGO') navigate('/ngo-dashboard', { replace: true });
        else if (user.role === 'Donor') navigate('/donor-dashboard', { replace: true });
        else if (user.role === 'Admin' || user.role === 'SuperAdmin') navigate('/admin', { replace: true });
      } catch (e) {
        // Fallback if localStorage is corrupted
      }
    }
  }, [navigate]);

  // Read the URL to lock the portal to the specific role clicked on the home page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    const selectedRole = searchParams.get('role');

    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }

    if (selectedRole && ['NGO', 'Donor', 'Admin'].includes(selectedRole)) {
      setFormData(prev => ({ ...prev, role: selectedRole }));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(false);

    const url = isLogin 
      ? `${import.meta.env.VITE_API_URL}/api/auth/login` 
      : `${import.meta.env.VITE_API_URL}/api/auth/register`;

    try {
      const response = await axios.post(url, formData);
      toast.success(isLogin ? `Welcome back to the ${formData.role} Portal!` : "Account created successfully!");
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === 'NGO') navigate('/ngo-dashboard', { replace: true });
      else if (role === 'Donor') navigate('/donor-dashboard', { replace: true });
      else if (role === 'Admin' || role === 'SuperAdmin') navigate('/admin', { replace: true });

    } catch (error) {
      setAuthError(true);
      toast.error(error.response?.data?.message || "Invalid credentials.");
    }
  };

  const handleChange = (e) => {
    setAuthError(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputBaseClass = "w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all font-medium backdrop-blur-md ";
  const defaultInputClass = inputBaseClass + "bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:bg-black/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20";
  const errorInputClass = inputBaseClass + "bg-rose-500/10 border-rose-500/30 text-rose-400 placeholder:text-rose-400/50 focus:border-rose-400 focus:bg-rose-500/20 focus:ring-4 focus:ring-rose-400/20";
  const adminInputClass = inputBaseClass + "bg-rose-500/5 border-rose-500/20 text-rose-300 placeholder:text-rose-400/50 focus:bg-rose-500/10 focus:border-rose-400 focus:ring-4 focus:ring-rose-400/20";

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } }, exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }, exit: { opacity: 0, y: -15, transition: { duration: 0.2 } } };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative z-10 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md glass-panel p-8 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r transition-colors duration-500 ${authError ? 'from-rose-400 to-rose-600' : isLogin ? 'from-emerald-400 to-teal-500' : 'from-orange-400 to-emerald-500'}`}></div>

        {/* NEW: Back Button to easily return to home page if they clicked the wrong card */}
        <Link to="/" className="absolute top-6 left-6 p-2 rounded-full bg-black/20 text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8 mt-6">
          <motion.div layout className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-500 shadow-sm ${authError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-white border border-white/10'}`}>
            <Shield className="w-7 h-7" />
          </motion.div>
          <motion.h2 layout className="text-3xl font-black text-white tracking-tight">
            {formData.role} Portal
          </motion.h2>
          <motion.p layout className="text-slate-300 font-medium mt-2 text-sm px-4">
            {isLogin ? `Securely access your ${formData.role} dashboard.` : `Register as a new ${formData.role}.`}
          </motion.p>
        </div>

        <div className="relative flex bg-black/20 border border-white/10 p-1.5 rounded-2xl mb-8 backdrop-blur-sm">
          <motion.div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/20" layout animate={{ left: isLogin ? "6px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          <button type="button" onClick={() => { setIsLogin(true); setAuthError(false); }} className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Log In</button>
          <button type="button" onClick={() => { setIsLogin(false); setAuthError(false); }} className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${!isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            <motion.div key={isLogin ? 'login' : 'register'} variants={containerVariants} initial="hidden" animate="show" exit="exit" className="space-y-5">
              
              {/* THE ROLE SELECTOR HAS BEEN COMPLETELY REMOVED */}

              {!isLogin && (
                <>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Organization Name</label>
                    <div className="relative group">
                      <Building2 className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-400 transition-colors" />
                      <input type="text" name="orgName" required value={formData.orgName} onChange={handleChange} className={defaultInputClass} placeholder="e.g. City Hope Shelter" />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Contact Number</label>
                    <div className="relative group">
                      <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-400 transition-colors" />
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={defaultInputClass} placeholder="e.g. +1 234 567 8900" />
                    </div>
                  </motion.div>
                </>
              )}

              {/* ADMIN SECRET CODE: Only visible during Admin Registration */}
              <AnimatePresence>
                {!isLogin && formData.role === 'Admin' && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                    <div className="pt-2">
                      <label className="block text-xs font-black text-rose-400 mb-1.5 uppercase tracking-wide items-center flex"><KeyRound className="w-3 h-3 mr-1" />Authorized Code Required</label>
                      <div className="relative group">
                        <Lock className="w-5 h-5 text-rose-400 absolute left-3.5 top-3.5" />
                        <input type="password" name="adminSecretCode" required value={formData.adminSecretCode} onChange={handleChange} className={adminInputClass} placeholder="Enter Master Passcode" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-rose-400' : 'text-slate-500 group-focus-within:text-emerald-400'}`} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={authError ? errorInputClass : defaultInputClass} placeholder="name@organization.com" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-300">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-rose-400' : 'text-slate-500 group-focus-within:text-emerald-400'}`} />
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className={authError ? errorInputClass : defaultInputClass} placeholder="••••••••••••" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className={`w-full py-4 text-lg flex items-center justify-center space-x-2 group ${authError ? 'glass-btn border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'glass-btn'}`}>
                  <span>{isLogin ? `Log into ${formData.role} Portal` : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;