import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, XCircle, UserPlus, UserMinus, Building2, HeartHandshake, ShieldAlert, Crown, Search, Ban, Trash2, Filter, Users, ClipboardList, EyeOff, Package, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [masterView, setMasterView] = useState('users'); 
  const [activeTab, setActiveTab] = useState("All"); 
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'SuperAdmin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/listings`) 
        ]);
        setUsers(usersRes.data);
        setListings(listingsRes.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load admin data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleVerify = async (userId) => { 
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/verify`);
      toast.success(response.data.isVerified ? "Trust badge granted!" : "Trust badge revoked.");
      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: response.data.isVerified } : u));
    } catch (error) { toast.error("Verification update failed."); }
  };

  const handlePromoteAdmin = async (userId, orgName) => {
    if (!isSuperAdmin) return; 
    if (!window.confirm(`Promote "${orgName}" to an Admin?`)) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/promote`);
      toast.success(`${orgName} is now an Admin!`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'Admin' } : u));
    } catch (error) { toast.error("Failed to elevate user."); }
  };

  const handleDemoteAdmin = async (userId, orgName) => {
    if (!isSuperAdmin) return; 
    if (!window.confirm(`Revoke Admin rights from "${orgName}"?`)) return;
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/demote`);
      toast.success(`${orgName} rights adjusted.`);
      setUsers(users.map(u => u._id === userId ? { ...u, role: response.data.role } : u));
    } catch (error) { toast.error("Failed to revoke admin rights."); }
  };

  const handleDeleteUser = async (userId, orgName) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`🚨 DANGER: Are you sure you want to permanently delete "${orgName}"? This cannot be undone!`)) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`);
      toast.success(`${orgName} has been permanently erased.`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const rowVariants = { 
    hidden: { opacity: 0, y: 15, scale: 0.98 }, 
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.orgName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || 
                       (activeTab === "Admins" && (user.role === "Admin" || user.role === "SuperAdmin")) ||
                       user.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredListings = listings.filter(listing => 
    listing.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    listing.donorId?.orgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl shadow-sm ${isSuperAdmin ? 'bg-amber-100' : 'bg-slate-100'}`}>
            {isSuperAdmin ? <Crown className="w-8 h-8 text-amber-600" /> : <Shield className="w-8 h-8 text-slate-800" />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {isSuperAdmin ? "SuperAdmin Control" : "Admin Dashboard"}
            </h1>
            <p className="text-gray-500 font-medium mt-1">Manage users and audit platform transactions.</p>
          </div>
        </div>

        <div className="relative group w-full md:w-72">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" placeholder={`Search ${masterView === 'users' ? 'organizations' : 'records'}...`} 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl py-3 pl-12 pr-4 focus:border-orange-500 focus:ring-0 outline-none transition-all shadow-sm font-medium" 
          />
        </div>
      </motion.div>

      {/* MASTER VIEW TOGGLE */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex shadow-inner border border-slate-200/60">
          <button onClick={() => setMasterView('users')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${masterView === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Users className={`w-4 h-4 mr-2 ${masterView === 'users' ? 'text-blue-500' : ''}`} />
            User Management
          </button>
          <button onClick={() => setMasterView('audit')} className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${masterView === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ClipboardList className={`w-4 h-4 mr-2 ${masterView === 'audit' ? 'text-emerald-500' : ''}`} />
            Donation Audit Log
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {masterView === 'users' ? (
          /* ========================================================
             VIEW 1: USER MANAGEMENT
             ======================================================== */
          <motion.div key="users-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="inline-flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
                <div className="flex items-center pl-3 pr-1 text-slate-400"><Filter className="w-4 h-4" /></div>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                {[{ id: 'All', icon: Users }, { id: 'NGO', icon: Building2 }, { id: 'Donor', icon: HeartHandshake }, { id: 'Admins', icon: ShieldAlert }, { id: 'Revoked', icon: Ban }].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center px-5 py-2.5 mx-0.5 text-sm font-bold transition-colors z-10 outline-none ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl'}`}>
                      {activeTab === tab.id && <motion.div layoutId="adminTabIndicator" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                      <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400'}`} />
                      {tab.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white border border-gray-100 rounded-4xl shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest">
                      <th className="py-5 px-6">Organization</th>
                      <th className="py-5 px-6">Classification</th>
                      <th className="py-5 px-6">Status</th>
                      <th className="py-5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.length === 0 ? (
                        <motion.tr key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan="4" className="py-12 text-center text-gray-400 font-bold">No users found.</td>
                        </motion.tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <motion.tr layout variants={rowVariants} initial="hidden" animate="show" exit="exit" key={user._id} className={`group transition-all duration-300 hover:shadow-md relative ${user.role === 'SuperAdmin' ? 'bg-amber-50/20' : user.role === 'Admin' ? 'bg-blue-50/20' : user.role === 'Revoked' ? 'bg-rose-50/10 opacity-75' : 'hover:bg-white'}`}>
                            <td className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-orange-400 to-orange-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></td>
                            <td className="py-6 px-6 flex items-center space-x-4">
                              <div className={`p-2.5 rounded-xl ${user.role === 'SuperAdmin' ? 'bg-amber-100' : user.role === 'Admin' ? 'bg-blue-100' : user.role === 'Donor' ? 'bg-emerald-100' : user.role === 'Revoked' ? 'bg-rose-100' : 'bg-orange-100'}`}>
                                {user.role === 'SuperAdmin' ? <Crown className="w-5 h-5 text-amber-600" /> : user.role === 'Admin' ? <ShieldAlert className="w-5 h-5 text-blue-600" /> : user.role === 'Donor' ? <HeartHandshake className="w-5 h-5 text-emerald-600" /> : user.role === 'Revoked' ? <Ban className="w-5 h-5 text-rose-600" /> : <Building2 className="w-5 h-5 text-orange-600" />}
                              </div>
                              <div>
                                <span className={`font-bold text-lg block ${user.role === 'Revoked' ? 'text-gray-500 line-through decoration-rose-300' : 'text-gray-900'}`}>{user.orgName || 'Unnamed Entity'}</span>
                                <span className="text-sm text-gray-400 font-medium block mt-0.5">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-6 px-6">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' : user.role === 'Admin' ? 'bg-blue-100 text-blue-700' : user.role === 'Donor' ? 'bg-emerald-50 text-emerald-700' : user.role === 'Revoked' ? 'bg-rose-100 text-rose-700' : 'bg-orange-50 text-orange-700'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-6 px-6">
                              {user.role === 'SuperAdmin' || user.role === 'Admin' ? (
                                <span className="text-slate-500 font-bold text-sm">System Override</span>
                              ) : user.role === 'Revoked' ? (
                                <span className="text-rose-500 font-bold text-sm flex items-center"><Ban className="w-4 h-4 mr-1.5"/> Locked Out</span>
                              ) : user.isVerified ? (
                                <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border border-blue-100"><CheckCircle className="w-4 h-4 mr-1.5" /> Verified</span>
                              ) : (
                                <span className="inline-flex items-center text-gray-400 px-3 py-1.5 text-sm font-medium"><XCircle className="w-4 h-4 mr-1.5" /> Pending</span>
                              )}
                            </td>
                            <td className="py-6 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {user.role === 'SuperAdmin' ? (
                                  <span className="text-sm font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 mr-2">SUPREME</span>
                                ) : user.role === 'Admin' ? (
                                  isSuperAdmin ? (
                                    <button onClick={() => handleDemoteAdmin(user._id, user.orgName)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-gray-100 hover:border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center transition-all shadow-sm"><UserMinus className="w-4 h-4 mr-1.5" /><span>Revoke</span></button>
                                  ) : (
                                    <span className="text-sm font-bold text-slate-400 mr-4">Co-Admin</span>
                                  )
                                ) : (
                                  <>
                                    {user.role !== 'Revoked' && (
                                      <button onClick={() => handleToggleVerify(user._id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${user.isVerified ? 'bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-600' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}>{user.isVerified ? 'Unverify' : 'Verify'}</button>
                                    )}
                                    {isSuperAdmin && (
                                      <button onClick={() => handlePromoteAdmin(user._id, user.orgName)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center transition-all shadow-sm"><UserPlus className="w-4 h-4 mr-1.5" /><span>{user.role === 'Revoked' ? 'Restore' : 'Promote'}</span></button>
                                    )}
                                  </>
                                )}
                                {isSuperAdmin && user._id !== currentUser.id && (
                                  <button onClick={() => handleDeleteUser(user._id, user.orgName)} title="Delete User Permanently" className="p-2.5 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-2"><Trash2 className="w-5 h-5" /></button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>

        ) : (

          /* ========================================================
             VIEW 2: DONATION AUDIT LOG (GOD MODE)
             ======================================================== */
          <motion.div key="audit-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white border border-gray-100 rounded-4xl shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest">
                      <th className="py-5 px-6">Food & Location</th>
                      <th className="py-5 px-6">Donor Details</th>
                      <th className="py-5 px-6">NGO Activity</th>
                      <th className="py-5 px-6">Status & Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                    <AnimatePresence mode="popLayout">
                      {filteredListings.length === 0 ? (
                        <motion.tr key="empty-audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan="4" className="py-12 text-center text-gray-400 font-bold">No records found.</td>
                        </motion.tr>
                      ) : (
                        filteredListings.map((listing) => (
                          <motion.tr layout variants={rowVariants} initial="hidden" animate="show" exit="exit" key={listing._id} className="group hover:bg-slate-50 transition-colors">
                            
                            {/* Food & Location Details */}
                            <td className="py-6 px-6">
                              <div className="flex items-start space-x-3">
                                <div className="bg-orange-100 p-2.5 rounded-xl mt-1"><Package className="w-5 h-5 text-orange-600" /></div>
                                <div>
                                  <span className="font-bold text-lg block text-slate-900">{listing.foodName}</span>
                                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-0.5 mb-1.5">Qty: {listing.quantity}</span>
                                  <div className="flex items-center text-xs text-slate-500 font-medium">
                                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    {listing.pickupLocation}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Donor Details & Date Posted */}
                            <td className="py-6 px-6">
                              <div className="font-bold text-slate-800 mb-1.5">{listing.donorId?.orgName || 'Unknown Donor'}</div>
                              <div className="text-xs text-slate-500 flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1" /> 
                                Posted: {new Date(listing.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            {/* NGO Details & Pickup Date */}
                            <td className="py-6 px-6">
                              {listing.claimedBy ? (
                                <div>
                                  <div className="font-bold text-blue-700 mb-1.5">{listing.claimedBy.orgName}</div>
                                  <div className="flex flex-col space-y-1.5">
                                    <span className="text-xs text-slate-500 flex items-center">
                                      OTP: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1 text-slate-700 font-bold">{listing.pickupOtp || 'N/A'}</span>
                                    </span>
                                    {listing.status.toLowerCase() === 'completed' && (
                                      <span className="text-xs font-bold text-emerald-600 flex items-center">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                        Picked: {new Date(listing.updatedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-sm font-medium italic">Unclaimed</span>
                              )}
                            </td>

                            {/* Status & Visibility Flags */}
                            <td className="py-6 px-6">
                              <div className="flex flex-col items-start space-y-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                  listing.status.toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  listing.status.toLowerCase() === 'claimed' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {listing.status}
                                </span>
                                
                                {/* THE AUDIT EXPOSE: Shows if the donor tried to hide it! */}
                                {listing.donorHidden && (
                                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-100" title="Donor soft-deleted this from their history">
                                    <EyeOff className="w-3 h-3 mr-1" /> Hidden by Donor
                                  </span>
                                )}
                              </div>
                            </td>
                            
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;