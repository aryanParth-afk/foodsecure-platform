import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, Building2, ArrowRight, KeyRound, ArrowLeft, Phone, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    orgName: '', 
    username: '',
    email: '', 
    phone: '',
    password: '', 
    role: 'NGO', // Defaults to NGO, but is instantly overwritten by the URL
    adminSecretCode: '' 
  });
  const [authError, setAuthError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
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

  const inputBaseClass = "w-full pl-11 pr-4 py-3.5 rounded-lg border outline-none transition-all font-medium text-sm ";
  const defaultInputClass = inputBaseClass + "bg-surface-bright border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-1 focus:ring-primary";
  const errorInputClass = inputBaseClass + "bg-error-container/20 border-error text-error placeholder:text-error/60 focus:border-error focus:ring-1 focus:ring-error";
  const adminInputClass = inputBaseClass + "bg-error-container/10 border-error/50 text-error placeholder:text-error/50 focus:border-error focus:ring-1 focus:ring-error";

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } }, exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }, exit: { opacity: 0, y: -15, transition: { duration: 0.2 } } };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative z-10 py-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-surface-container-lowest ink-border soft-elevation p-8 relative overflow-hidden rounded-xl"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${authError ? 'bg-error' : 'bg-primary'}`}></div>

        {/* NEW: Back Button to easily return to home page if they clicked the wrong card */}
        <Link to="/" className="absolute top-6 left-6 p-2 rounded bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors border border-outline-variant">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="text-center mb-8 mt-6">
          <motion.div layout className={`mx-auto w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-colors duration-500 shadow-sm border ${authError ? 'bg-error-container text-error border-error' : 'bg-surface-container border-outline text-primary'}`}>
            <Shield className="w-6 h-6" />
          </motion.div>
          <motion.h2 layout className="font-display-lg text-3xl text-on-surface tracking-tight">
            {formData.role} Portal
          </motion.h2>
          <motion.p layout className="font-body-md text-on-surface-variant mt-2 text-sm px-4">
            {isLogin ? `Securely access your ${formData.role} dashboard.` : `Register as a new ${formData.role}.`}
          </motion.p>
        </div>

        <div className="relative flex bg-surface-container border border-outline-variant p-1.5 rounded-lg mb-8">
          <motion.div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-surface-container-lowest rounded shadow-sm border border-outline-variant" layout animate={{ left: isLogin ? "6px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          <button type="button" onClick={() => { setIsLogin(true); setAuthError(false); }} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors rounded ${isLogin ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Log In</button>
          <button type="button" onClick={() => { setIsLogin(false); setAuthError(false); }} className={`flex-1 py-2 text-sm font-bold z-10 transition-colors rounded ${!isLogin ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            <motion.div key={isLogin ? 'login' : 'register'} variants={containerVariants} initial="hidden" animate="show" exit="exit" className="space-y-5">
              
              {!isLogin && (
                <>
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Organization Name</label>
                    <div className="relative group">
                      <Building2 className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-3.5 group-focus-within:text-primary transition-colors" />
                      <input type="text" name="orgName" required value={formData.orgName} onChange={handleChange} className={defaultInputClass} placeholder="e.g. City Hope Shelter" />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Contact Number</label>
                    <div className="relative group">
                      <Phone className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-3.5 group-focus-within:text-primary transition-colors" />
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={defaultInputClass} placeholder="e.g. +1 234 567 8900" />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Username</label>
                    <div className="relative group">
                      <User className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-3.5 group-focus-within:text-primary transition-colors" />
                      <input type="text" name="username" required value={formData.username} onChange={handleChange} className={defaultInputClass} placeholder="e.g. foodhero2026" />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-start leading-tight">
                      <span className="text-primary mr-1 text-xs leading-none">*</span> 
                      Must contain at least 1 capital letter and 1 symbol (!@#$%^&*).
                    </p>
                  </motion.div>
                </>
              )}

              {/* ADMIN SECRET CODE: Only visible during Admin Registration */}
              <AnimatePresence>
                {!isLogin && formData.role === 'Admin' && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-error mb-1.5 uppercase tracking-wide items-center flex"><KeyRound className="w-3 h-3 mr-1" />Authorized Code Required</label>
                      <div className="relative group">
                        <Lock className="w-5 h-5 text-error absolute left-3.5 top-3.5" />
                        <input 
                          type={showAdminCode ? "text" : "password"} 
                          name="adminSecretCode" 
                          required 
                          value={formData.adminSecretCode} 
                          onChange={handleChange} 
                          className={adminInputClass.replace('pr-4', 'pr-12')} 
                          placeholder="Enter Master Passcode" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowAdminCode(!showAdminCode)} 
                          className="absolute right-4 top-3.5 text-error/70 hover:text-error transition-colors focus:outline-none"
                        >
                          {showAdminCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{isLogin ? 'Email or Username' : 'Email Address'}</label>
                <div className="relative group">
                  <Mail className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-error' : 'text-on-surface-variant group-focus-within:text-primary'}`} />
                  <input type={isLogin ? "text" : "email"} name="email" required value={formData.email} onChange={handleChange} className={authError ? errorInputClass : defaultInputClass} placeholder={isLogin ? "name@organization.com or username" : "name@organization.com"} />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-on-primary-fixed-variant transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-error' : 'text-on-surface-variant group-focus-within:text-primary'}`} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className={authError ? errorInputClass.replace('pr-4', 'pr-12') : defaultInputClass.replace('pr-4', 'pr-12')} 
                    placeholder="••••••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className={`absolute right-4 top-3.5 transition-colors focus:outline-none ${authError ? 'text-error hover:text-error/80' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className={`w-full py-3.5 text-sm font-label-md uppercase tracking-widest flex items-center justify-center space-x-2 group rounded ${authError ? 'bg-error text-on-error hover:bg-error/90' : 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'} transition-colors`}>
                  <span>{isLogin ? `Log into ${formData.role} Portal` : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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