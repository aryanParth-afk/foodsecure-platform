import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HandHeart, LogOut, Bell, LayoutDashboard, BarChart3, Clock, ChevronDown, Settings, CheckCircle2, AlertCircle, Info, CheckCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // --- NEW: Scroll Animation States ---
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // State for Dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // --- NEW: The "Smart Scroll" Listener ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down, and we are past the very top (80px), hide the nav
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setIsProfileOpen(false); // Auto-close dropdowns if they start scrolling
        setIsNotifOpen(false);
      } 
      // If scrolling up, immediately show the nav
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // "Polling" for real-time notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const userId = user.id || user._id;
        const res = await axios.get(`${apiUrl}/api/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [user?.id, user?._id, apiUrl]);

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
  const linkClass = (path) => `flex items-center text-sm font-bold transition-colors ${isActive(path) ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`;
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const getNotifIcon = (type) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (type === 'warning') return <AlertCircle className="w-5 h-5 text-orange-400" />;
    return <Info className="w-5 h-5 text-blue-400" />;
  };

  // Dynamic links
  let navLinks = [];
  if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
    navLinks = [
      { name: 'Users', path: '/admin', icon: LayoutDashboard },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Live Map', path: '/ngo-map', icon: MapPin },
    ];
  } else if (user?.role === 'Donor') {
    navLinks = [
      { name: 'Post Food', path: '/donor-dashboard', icon: LayoutDashboard },
      { name: 'History', path: '/history', icon: Clock },
    ];
  } else if (user?.role === 'NGO') {
    navLinks = [
      { name: 'Dashboard', path: '/ngo-dashboard', icon: LayoutDashboard },
      { name: 'Live Map', path: '/ngo-map', icon: MapPin },
    ];
  }

  return (
    <>
      {/* INVISIBLE PLACEHOLDER: 
        Because our top nav is now "fixed", it gets pulled out of the layout. 
        We add this 80px tall empty div so the page content doesn't snap up and hide behind the nav! 
      */}
      <div className="h-20 w-full shrink-0"></div>

      {/* 1. TOP NAVBAR 
        UPDATED: Switched from 'sticky' to 'fixed', and added the smooth sliding transition.
      */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-lg transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors shadow-sm">
                <HandHeart className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-black text-2xl text-white tracking-tight hidden sm:block">FoodRescue</span>
            </Link>

            {/* DESKTOP NAVIGATION LINKS */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                  <link.icon className="w-4 h-4 mr-2" /> {link.name}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE: NOTIFICATIONS & PROFILE */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              {user ? (
                <>
                  {/* 🔔 NOTIFICATION BELL */}
                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                      className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10 focus:outline-none"
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
                          className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden origin-top-right z-50 flex flex-col max-h-100 backdrop-blur-xl"
                        >
                          <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center shrink-0">
                            <h3 className="font-black text-white">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center bg-blue-500/10 px-2 py-1 rounded-md transition-colors border border-blue-500/20">
                                <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                              </button>
                            )}
                          </div>

                          <div className="overflow-y-auto overflow-x-hidden flex-1 max-h-[60vh]">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 font-medium text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-50" />
                                You're all caught up!
                              </div>
                            ) : (
                              <div className="divide-y divide-white/10">
                                {notifications.map(notif => (
                                  <div 
                                    key={notif._id} 
                                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                    className={`p-4 flex gap-3 transition-colors ${!notif.isRead ? 'bg-blue-500/10 cursor-pointer hover:bg-blue-500/20' : 'bg-transparent'}`}
                                  >
                                    <div className="shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                                    <div>
                                      <p className={`text-sm ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{notif.message}</p>
                                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                    {!notif.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0 ml-auto shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-px h-6 bg-white/20 hidden sm:block mx-1"></div>

                  {/* 👤 PROFILE DROPDOWN */}
                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                      className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                        <span className="text-emerald-400 text-xs font-black tracking-widest">{getInitials(user.orgName)}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-3xl shadow-xl overflow-hidden origin-top-right z-50 backdrop-blur-xl"
                        >
                          <div className="p-5 bg-black/40 border-b border-white/10">
                            <p className="text-sm font-black text-white truncate">{user.orgName || 'User'}</p>
                            <p className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest mt-1.5 ${
                              user.role === 'SuperAdmin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                              user.role === 'Admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              user.role === 'Donor' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            }`}>
                              {user.role} Account
                            </p>
                          </div>

                          <div className="p-2 space-y-1">
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                              <Settings className="w-4 h-4 mr-3 text-slate-400" /> Account Settings
                            </Link>
                            <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors text-left">
                              <LogOut className="w-4 h-4 mr-3 text-rose-500" /> Secure Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth?mode=login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block">Log In</Link>
                  <Link to="/auth?mode=register" className="glass-btn px-5 py-2.5 text-sm">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. BOTTOM MOBILE APP BAR 
        UPDATED: Also added the slide-down animation when scrolling down.
      */}
      {user && navLinks.length > 0 && (
        <div 
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 z-[999] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-safe transition-transform duration-300 ease-in-out ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-around items-center h-16 px-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                  isActive(link.path) ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive(link.path) ? 'bg-emerald-500/20' : 'bg-transparent'}`}>
                  <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-bold ${isActive(link.path) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;