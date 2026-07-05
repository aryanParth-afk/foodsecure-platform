import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, LayoutDashboard, Clock, ChevronDown, Settings, CheckCircle2, AlertCircle, Info, CheckCheck, MapPin, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // State for Dropdowns
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isJoinMenuOpen, setIsJoinMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const joinMenuRef = useRef(null);

  // "Polling" for real-time notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const userId = user.id || user._id;
        const res = await axios.get(`${apiUrl}/api/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user, apiUrl]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (joinMenuRef.current && !joinMenuRef.current.contains(event.target)) {
        setIsJoinMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsProfileOpen(false);
    navigate('/');
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await axios.put(`${apiUrl}/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const userId = user.id || user._id;
      await axios.put(`${apiUrl}/api/notifications/${userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotifIcon = (type) => {
    switch(type) {
      case 'claim': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'expired': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const linkClass = (path) => {
    return location.pathname === path 
      ? 'text-primary font-bold transition-opacity hover:opacity-80' 
      : 'text-on-surface-variant transition-colors hover:text-primary font-medium';
  };

  let navLinks = [];
  if (user?.role === 'Admin') {
    navLinks = [{ name: 'Admin Dashboard', path: '/admin-dashboard', icon: LayoutDashboard }];
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
      <div className="h-20 w-full shrink-0"></div>

      {/* TOP NAVIGATION: EDITORIAL IMPACT THEME */}
      <nav className="bg-surface-bright fixed top-0 w-full z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop h-20 w-full max-w-container-max mx-auto">
          
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-headline-lg text-[32px] uppercase tracking-tighter text-primary">FoodRescue</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-gutter-desktop">
            {location.pathname === '/' && (
              <a href="#about" className={linkClass('/#about')}>About Us</a>
            )}
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            
            {user ? (
              <>
                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                    className="relative p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-primary rounded-full text-[9px] font-bold text-on-primary">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border ink-border rounded-lg shadow-xl overflow-hidden origin-top-right z-50 flex flex-col max-h-[60vh]"
                      >
                        <div className="p-4 border-b border-outline-variant flex justify-between items-center shrink-0">
                          <h3 className="font-bold text-on-surface">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-secondary flex items-center px-2 py-1 transition-colors">
                              <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden flex-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-outline-variant" />
                              You're all caught up!
                            </div>
                          ) : (
                            <div className="divide-y divide-outline-variant">
                              {notifications.map(notif => (
                                <div 
                                  key={notif._id} 
                                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                  className={`p-4 flex gap-3 transition-colors ${!notif.isRead ? 'bg-surface-container cursor-pointer' : 'bg-transparent'}`}
                                >
                                  <div className="shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                                  <div>
                                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>{notif.message}</p>
                                    <p className="text-[10px] font-bold text-tertiary-container mt-1 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                                  {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 ml-auto"></div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-6 bg-outline-variant hidden sm:block mx-1"></div>

                {/* PROFILE */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-surface-container transition-colors focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-on-primary-container text-xs font-bold tracking-widest">{getInitials(user.orgName)}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border ink-border rounded-lg shadow-xl overflow-hidden origin-top-right z-50"
                      >
                        <div className="p-5 border-b border-outline-variant">
                          <p className="font-bold text-lg text-on-surface leading-tight truncate">{user.orgName}</p>
                          {user.username && <p className="text-xs font-medium text-on-surface-variant mt-0.5">@{user.username}</p>}
                          <p className="text-sm font-medium text-primary mt-1.5">{user.role}</p>
                        </div>
                        
                        <div className="p-2 space-y-1">
                          <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-3 w-full p-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors">
                            <Settings className="w-4 h-4 shrink-0" />
                            <span>Account Settings</span>
                          </Link>
                          
                          <div className="h-px bg-outline-variant my-1 mx-2"></div>
                          
                          <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-3 text-sm font-medium text-error hover:bg-error-container hover:text-on-error-container rounded-md transition-colors">
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <div className="relative hidden md:block" ref={joinMenuRef}>
                  <button 
                    onClick={() => setIsJoinMenuOpen(!isJoinMenuOpen)}
                    className="px-8 py-2 bg-primary text-on-primary font-label-md rounded active:scale-95 transition-transform uppercase tracking-wider flex items-center gap-2"
                  >
                    Join Now <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isJoinMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isJoinMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border ink-border rounded-lg shadow-xl overflow-hidden origin-top-right z-50 p-2 space-y-1"
                      >
                        <Link to="/auth?role=NGO" onClick={() => setIsJoinMenuOpen(false)} className="flex items-center space-x-3 w-full p-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors">
                          <span>NGO Portal</span>
                        </Link>
                        <Link to="/auth?role=Donor" onClick={() => setIsJoinMenuOpen(false)} className="flex items-center space-x-3 w-full p-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors">
                          <span>Donor Portal</span>
                        </Link>
                        <Link to="/auth?role=Admin" onClick={() => setIsJoinMenuOpen(false)} className="flex items-center space-x-3 w-full p-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors">
                          <span>Admin Portal</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="md:hidden">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                        className="absolute top-20 left-0 w-full bg-surface-container-lowest border-b ink-border shadow-xl z-40 p-4 space-y-4"
                      >
                        {location.pathname === '/' && (
                          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block w-full p-3 text-center font-bold text-on-surface hover:bg-surface-container rounded-md transition-colors uppercase tracking-wider">
                            About Us
                          </a>
                        )}
                        <div className="h-px bg-outline-variant w-full"></div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center mt-2 mb-2">Join FoodRescue</p>
                        <Link to="/auth?role=NGO" onClick={() => setIsMobileMenuOpen(false)} className="block w-full p-3 text-center text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high rounded-md transition-colors">
                          NGO Portal
                        </Link>
                        <Link to="/auth?role=Donor" onClick={() => setIsMobileMenuOpen(false)} className="block w-full p-3 text-center text-sm font-bold bg-primary text-on-primary hover:bg-on-primary-fixed-variant rounded-md transition-colors">
                          Donor Portal
                        </Link>
                        <Link to="/auth?role=Admin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full p-3 text-center text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high rounded-md transition-colors">
                          Admin Portal
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      {user && (
        <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-bright border-t border-outline-variant shadow-sm flex justify-around items-center py-2 px-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-90 ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <link.icon className="w-5 h-5 mb-1" />
                <span className="font-label-sm">{link.name}</span>
              </Link>
            );
          })}
          <Link to="/profile" className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-90 ${location.pathname === '/profile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <User className="w-5 h-5 mb-1" />
            <span className="font-label-sm">Profile</span>
          </Link>
        </nav>
      )}
    </>
  );
};

export default Navbar;