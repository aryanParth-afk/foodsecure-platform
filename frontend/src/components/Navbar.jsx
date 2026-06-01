import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HandHeart, LogOut, Bell, LayoutDashboard, BarChart3, Clock, User, ChevronDown, Settings, CheckCircle2, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // State for Dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch Notifications on load
  useEffect(() => {
    if (user) {
      axios.get(`${apiUrl}/api/notifications/${user.id || user._id}`)
        .then(res => setNotifications(res.data))
        .catch(err => console.error("Failed to load notifications", err));
    }
  }, [user?.id, apiUrl]);

  // Click outside listener for BOTH dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
    setTimeout(() => navigate('/auth?mode=login'), 10);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.patch(`${apiUrl}/api/notifications/${notifId}/read`);
      setNotifications(notifications.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch (error) { console.error("Could not mark as read", error); }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await axios.patch(`${apiUrl}/api/notifications/read-all/${user.id || user._id}`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error("Could not mark all as read", error); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center text-sm font-bold transition-colors ${isActive(path) ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`;
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  // Helper to pick icons based on notification type
  const getNotifIcon = (type) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (type === 'warning') return <AlertCircle className="w-5 h-5 text-orange-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-orange-50 p-2.5 rounded-2xl border border-orange-100 group-hover:bg-orange-100 transition-colors shadow-sm">
              <HandHeart className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight hidden sm:block">FoodRescue</span>
          </Link>

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

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            {user ? (
              <>
                {/* 🔔 NOTIFICATION BELL DROPDOWN */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                    className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100 focus:outline-none"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-rose-500 rounded-full border-2 border-white text-[9px] font-black text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden origin-top-right z-50 flex flex-col max-h-100"
                      >
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                          <h3 className="font-black text-slate-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2 py-1 rounded-md transition-colors">
                              <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden flex-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 font-medium text-sm">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-50" />
                              You're all caught up!
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-50">
                              {notifications.map(notif => (
                                <div 
                                  key={notif._id} 
                                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                  className={`p-4 flex gap-3 transition-colors ${!notif.isRead ? 'bg-blue-50/50 cursor-pointer hover:bg-blue-50' : 'bg-white'}`}
                                >
                                  <div className="shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                                  <div>
                                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{notif.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 ml-auto"></div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

                {/* 👤 PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-black tracking-widest">{getInitials(user.orgName)}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden origin-top-right z-50"
                      >
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

                        <div className="p-2 space-y-1">
                          <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                            <Settings className="w-4 h-4 mr-3 text-slate-400" /> Account Settings
                          </Link>
                          <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left">
                            <LogOut className="w-4 h-4 mr-3 text-rose-400" /> Secure Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth?mode=login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">Log In</Link>
                <Link to="/auth?mode=register" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;