import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, Building2, ArrowRight, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    orgName: '', 
    email: '', 
    password: '', 
    role: 'NGO',
    adminSecretCode: '' 
  });
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  
  const location = useLocation();

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
      // formData explicitly includes the `role`, which triggers the backend Bouncer logic during login
      const response = await axios.post(url, formData);
      toast.success(isLogin ? `Welcome back to the ${formData.role} Portal!` : "Account created successfully!");
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === 'NGO') navigate('/ngo-dashboard');
      else if (role === 'Donor') navigate('/donor-dashboard');
      else if (role === 'Admin' || role === 'SuperAdmin') navigate('/admin');

    } catch (error) {
      setAuthError(true);
      toast.error(error.response?.data?.message || "Invalid credentials.");
    }
  };

  const handleChange = (e) => {
    setAuthError(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputBaseClass = "w-full pl-11 pr-4 py-3.5 rounded-xl border-2 outline-none transition-all font-medium ";
  const defaultInputClass = inputBaseClass + "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  const errorInputClass = inputBaseClass + "bg-rose-50 border-rose-300 text-rose-900 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/20";
  const adminInputClass = inputBaseClass + "bg-red-50 border-red-200 text-red-900 placeholder:text-red-300 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } }, exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }, exit: { opacity: 0, y: -15, transition: { duration: 0.2 } } };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-4xl p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-linear-to-r transition-colors duration-500 ${authError ? 'from-rose-400 to-rose-600' : isLogin ? 'from-blue-500 to-indigo-600' : 'from-orange-400 to-emerald-500'}`}></div>

        <div className="text-center mb-8 mt-2">
          <motion.div layout className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-500 shadow-sm ${authError ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
            <Shield className="w-7 h-7" />
          </motion.div>
          {/* DYNAMIC TITLE BASED ON SELECTED ROLE */}
          <motion.h2 layout className="text-3xl font-black text-slate-900 tracking-tight">
            {formData.role} Portal
          </motion.h2>
          <motion.p layout className="text-slate-500 font-medium mt-2 text-sm">
            {isLogin ? 'Securely access your dashboard.' : 'Join the food rescue network today.'}
          </motion.p>
        </div>

        <div className="relative flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <motion.div className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm border border-slate-200" layout animate={{ left: isLogin ? "6px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          <button type="button" onClick={() => { setIsLogin(true); setAuthError(false); }} className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Log In</button>
          <button type="button" onClick={() => { setIsLogin(false); setAuthError(false); }} className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${!isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            <motion.div key={isLogin ? 'login' : 'register'} variants={containerVariants} initial="hidden" animate="show" exit="exit" className="space-y-5">
              
              {/* ROLE SELECTOR: NOW VISIBLE ON BOTH LOGIN AND REGISTER */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-slate-700 mb-2">Access Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setFormData({...formData, role: 'NGO'})} className={`py-2 text-sm rounded-xl font-bold border-2 transition-all ${formData.role === 'NGO' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm shadow-orange-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>NGO</button>
                  <button type="button" onClick={() => setFormData({...formData, role: 'Donor'})} className={`py-2 text-sm rounded-xl font-bold border-2 transition-all ${formData.role === 'Donor' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>Donor</button>
                  <button type="button" onClick={() => setFormData({...formData, role: 'Admin'})} className={`py-2 text-sm rounded-xl font-bold border-2 transition-all ${formData.role === 'Admin' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm shadow-blue-100' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>Admin</button>
                </div>
              </motion.div>

              {!isLogin && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Organization Name</label>
                  <div className="relative group">
                    <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" name="orgName" required value={formData.orgName} onChange={handleChange} className={defaultInputClass} placeholder="e.g. City Hope Shelter" />
                  </div>
                </motion.div>
              )}

              {/* ADMIN SECRET CODE: Only visible during Admin Registration */}
              <AnimatePresence>
                {!isLogin && formData.role === 'Admin' && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
                    <div className="pt-2">
                      <label className="block text-xs font-black text-red-600 mb-1.5 uppercase tracking-wide items-center"><KeyRound className="w-3 h-3 mr-1" />Authorized Code Required</label>
                      <div className="relative group">
                        <Lock className="w-5 h-5 text-red-400 absolute left-3.5 top-3.5" />
                        <input type="password" name="adminSecretCode" required value={formData.adminSecretCode} onChange={handleChange} className={adminInputClass} placeholder="Enter Master Passcode" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={authError ? errorInputClass : defaultInputClass} placeholder="name@organization.com" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className={`w-5 h-5 absolute left-3.5 top-3.5 transition-colors ${authError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className={authError ? errorInputClass : defaultInputClass} placeholder="••••••••••••" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" className={`w-full text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 group ${authError ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200/50' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'}`}>
                  <span>{isLogin ? 'Secure Login' : 'Create Account'}</span>
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