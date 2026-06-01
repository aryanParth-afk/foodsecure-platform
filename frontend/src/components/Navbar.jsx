import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HandHeart, LogOut, Bell, LayoutDashboard, BarChart3, Clock, User, ChevronDown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // NEW: State and Ref for the Dropdown Menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Replace the current protected route with Home page in browser history
    navigate('/', { replace: true });
    
    // Instantly push to Login page
    setTimeout(() => {
      navigate('/auth?mode=login');
    }, 10);
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center text-sm font-bold transition-colors ${isActive(path) ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`;

  // Helper to get initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-orange-50 p-2.5 rounded-2xl border border-orange-100 group-hover:bg-orange-100 transition-colors shadow-sm">
              <HandHeart className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight hidden sm:block">FoodRescue</span>
          </Link>

          {/* CENTER: Dynamic Quick Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user?.role === 'Admin' || user?.role === 'SuperAdmin' ? (
              <>
                <Link to="/admin" className={linkClass('/admin')}><LayoutDashboard className="w-4 h-4 mr-2" /> Users</Link>
                <Link to="/analytics" className={linkClass('/analytics')}><BarChart3 className="w-4 h-4 mr-2" /> Analytics</Link>
              </>
            ) : user?.role === 'Donor' ? (
              <>
                <Link to="/donor-dashboard" className={linkClass('/donor-dashboard')}><LayoutDashboard className="w-4 h-4 mr-2" /> Post Food</Link>
                <Link to="/history" className={linkClass('/history')}><Clock className="w-4 h-4 mr-2" /> Impact History</Link>
              </>
            ) : null}
          </div>

          {/* RIGHT: User Actions & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            {user ? (
              <>
                {/* Notification Bell (Kept outside for quick access) */}
                <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
                </button>

                <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

                {/* COMPACT PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 focus:outline-none"
                  >
                    {/* Dummy Avatar */}
                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-black tracking-widest">{getInitials(user.orgName)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Overlay */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden origin-top-right"
                      >
                        {/* Header Box */}
                        <div className="p-5 bg-slate-50 border-b border-slate-100">
                          <p className="text-sm font-black text-slate-900 truncate">{user.orgName || 'User'}</p>
                          <p className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mt-1.5 ${
                            user.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' :
                            user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'Donor' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {user.role} Account
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-1">
                          <Link 
                            to="/profile" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4 mr-3 text-slate-400" /> 
                            Account Settings
                          </Link>
                          
                          <button 
                            onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                            className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 mr-3 text-rose-400" /> 
                            Secure Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Logged Out View */
              <div className="flex items-center space-x-4">
                <Link to="/auth?mode=login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                  Log In
                </Link>
                <Link to="/auth?mode=register" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;