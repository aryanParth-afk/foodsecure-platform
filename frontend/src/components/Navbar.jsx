import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HandHeart, LogOut, Bell, LayoutDashboard, BarChart3, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth?mode=login');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center text-sm font-bold transition-colors ${isActive(path) ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
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
          <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
            {user ? (
              <>
                {/* Notification Bell */}
                <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
                </button>

                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

                {/* User Identity & Actions */}
                <div className="flex items-center space-x-4">
                  
                  {/* Name and Role Badge */}
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-black text-slate-800">{user.orgName || 'User'}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                      user.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' :
                      user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'Donor' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Settings & Logout Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link to="/profile" className="flex items-center p-2 sm:px-3 sm:py-2.5 text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-200 transition-all shadow-sm">
                      <span className="hidden sm:inline font-bold text-sm mr-2">Settings</span>
                      <User className="w-4 h-4" />
                    </Link>

                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleLogout} 
                      className="flex items-center p-2 sm:px-4 sm:py-2.5 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm group"
                    >
                      <span className="hidden sm:block mr-2">Logout</span>
                      <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </motion.button>
                  </div>
                  
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