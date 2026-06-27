import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, UserPlus, UserMinus, Building2, HeartHandshake, ShieldAlert, Crown, Search, Ban, Trash2, Filter, Users, ClipboardList, EyeOff, Package, MapPin, Clock } from 'lucide-react';
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
    } catch (error) { toast.error("Failed to demote user."); }
  };

  const handleDeleteUser = async (userId, orgName) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`PERMANENTLY DELETE "${orgName}"? This action is irreversible!`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`);
      toast.success(`User ${orgName} has been purged from the system.`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) { toast.error("Failed to delete user."); }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.orgName?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "Admins") return matchesSearch && (user.role === 'Admin' || user.role === 'SuperAdmin');
    if (activeTab === "Revoked") return matchesSearch && user.role === 'Revoked';
    if (activeTab !== "All") return matchesSearch && user.role === activeTab;
    return matchesSearch;
  });

  const filteredListings = listings.filter(listing => {
    return listing.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           listing.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           listing.donorId?.orgName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const rowVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }, exit: { opacity: 0, x: -20, transition: { duration: 0.2 } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bright">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-32">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div>
          <h1 className="font-display-lg text-4xl text-on-surface tracking-tight flex items-center">
            {isSuperAdmin ? <Crown className="w-8 h-8 mr-3 text-secondary" /> : <Shield className="w-8 h-8 mr-3 text-primary" />}
            SYSTEM CONTROL
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2 font-medium">Platform oversight, audits, and security configuration.</p>
        </div>

        <div className="relative group w-full md:w-72">
          <Search className="w-5 h-5 text-on-surface-variant absolute left-4 top-3.5 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" placeholder={`Search ${masterView === 'users' ? 'organizations' : 'records'}...`} 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant text-on-surface placeholder:text-on-surface-variant rounded-xl py-3 pl-12 pr-4 focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm font-medium" 
          />
        </div>
      </motion.div>

      {/* MASTER VIEW TOGGLE */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-surface-container p-1.5 rounded-xl inline-flex border border-outline-variant shadow-sm">
          <button onClick={() => setMasterView('users')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${masterView === 'users' ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <Users className={`w-4 h-4 mr-2 ${masterView === 'users' ? 'text-primary' : ''}`} />
            User Management
          </button>
          <button onClick={() => setMasterView('audit')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${masterView === 'audit' ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <ClipboardList className={`w-4 h-4 mr-2 ${masterView === 'audit' ? 'text-secondary' : ''}`} />
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
              <div className="inline-flex items-center bg-surface-container p-1.5 rounded-xl border border-outline-variant">
                <div className="flex items-center pl-3 pr-1 text-on-surface-variant"><Filter className="w-4 h-4" /></div>
                <div className="w-px h-6 bg-outline-variant mx-2"></div>
                {[{ id: 'All', icon: Users }, { id: 'NGO', icon: Building2 }, { id: 'Donor', icon: HeartHandshake }, { id: 'Admins', icon: ShieldAlert }, { id: 'Revoked', icon: Ban }].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center px-5 py-2.5 mx-0.5 text-sm font-bold transition-colors z-10 outline-none ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest rounded-lg'}`}>
                      {activeTab === tab.id && <motion.div layoutId="adminTabIndicator" className="absolute inset-0 bg-surface-container-lowest rounded-lg border border-outline-variant -z-10 shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                      <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`} />
                      {tab.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-surface-container-lowest ink-border soft-elevation rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-bold text-xs uppercase tracking-widest">
                      <th className="py-5 px-6">Organization</th>
                      <th className="py-5 px-6">Classification</th>
                      <th className="py-5 px-6">Status</th>
                      <th className="py-5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-on-surface font-medium">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.length === 0 ? (
                        <motion.tr key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan="4" className="py-12 text-center text-on-surface-variant font-bold">No users found.</td>
                        </motion.tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <motion.tr layout variants={rowVariants} initial="hidden" animate="show" exit="exit" key={user._id} className={`group transition-all duration-300 relative ${user.role === 'SuperAdmin' ? 'bg-secondary-fixed/5' : user.role === 'Admin' ? 'bg-primary-container/10' : user.role === 'Revoked' ? 'bg-error-container/20 opacity-75' : 'hover:bg-surface-container'}`}>
                            <td className="absolute left-0 top-0 h-full w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></td>
                            <td className="py-6 px-6 flex items-center space-x-4">
                              <div className={`p-2.5 rounded-lg border ${user.role === 'SuperAdmin' ? 'bg-secondary-fixed border-secondary-fixed-dim text-on-secondary-fixed-variant' : user.role === 'Admin' ? 'bg-primary-container border-primary-fixed-dim text-on-primary-container' : user.role === 'Donor' ? 'bg-tertiary-container border-outline text-on-tertiary-container' : user.role === 'Revoked' ? 'bg-error-container border-error text-on-error-container' : 'bg-surface-container border-outline text-on-surface'}`}>
                                {user.role === 'SuperAdmin' ? <Crown className="w-5 h-5" /> : user.role === 'Admin' ? <ShieldAlert className="w-5 h-5" /> : user.role === 'Donor' ? <HeartHandshake className="w-5 h-5" /> : user.role === 'Revoked' ? <Ban className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className={`font-bold text-lg block ${user.role === 'Revoked' ? 'text-on-surface-variant line-through decoration-error/50' : 'text-on-surface'}`}>{user.orgName || 'Unnamed Entity'}</span>
                                <span className="text-sm text-on-surface-variant font-medium block mt-0.5">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-6 px-6">
                              <span className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider border ${user.role === 'SuperAdmin' ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed-dim' : user.role === 'Admin' ? 'bg-primary-container text-on-primary-container border-primary-fixed-dim' : user.role === 'Donor' ? 'bg-tertiary-container text-on-tertiary-container border-outline' : user.role === 'Revoked' ? 'bg-error-container text-on-error-container border-error' : 'bg-surface-container text-on-surface border-outline'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-6 px-6">
                              {user.role === 'SuperAdmin' || user.role === 'Admin' ? (
                                <span className="text-on-surface-variant font-bold text-sm">System Override</span>
                              ) : user.role === 'Revoked' ? (
                                <span className="text-error font-bold text-sm flex items-center"><Ban className="w-4 h-4 mr-1.5"/> Locked Out</span>
                              ) : (
                                <span className="inline-flex items-center bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded text-sm font-bold border border-primary-fixed-dim"><CheckCircle className="w-4 h-4 mr-1.5" /> Active</span>
                              )}
                            </td>
                            <td className="py-6 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {user.role === 'SuperAdmin' ? (
                                  <span className="text-sm font-black text-on-secondary-fixed-variant bg-secondary-fixed px-4 py-2 rounded border border-secondary-fixed-dim mr-2">SUPREME</span>
                                ) : user.role === 'Admin' ? (
                                  isSuperAdmin ? (
                                    <button onClick={() => handleDemoteAdmin(user._id, user.orgName)} className="px-4 py-2.5 rounded text-sm font-bold bg-surface-container border border-outline hover:border-error hover:text-error hover:bg-error-container flex items-center transition-all"><UserMinus className="w-4 h-4 mr-1.5" /><span>Revoke</span></button>
                                  ) : (
                                    <span className="text-sm font-bold text-on-surface-variant mr-4">Co-Admin</span>
                                  )
                                ) : (
                                  <>
                                    {isSuperAdmin && (
                                      <button onClick={() => handlePromoteAdmin(user._id, user.orgName)} className="px-4 py-2.5 rounded text-sm font-bold bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface flex items-center transition-all"><UserPlus className="w-4 h-4 mr-1.5" /><span>{user.role === 'Revoked' ? 'Restore' : 'Promote'}</span></button>
                                    )}
                                  </>
                                )}
                                {isSuperAdmin && user._id !== currentUser.id && (
                                  <button onClick={() => handleDeleteUser(user._id, user.orgName)} title="Delete User Permanently" className="p-2.5 rounded text-on-surface-variant hover:bg-error-container hover:text-error border border-transparent hover:border-error transition-colors ml-2"><Trash2 className="w-5 h-5" /></button>
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
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-surface-container-lowest ink-border soft-elevation rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-bold text-xs uppercase tracking-widest">
                      <th className="py-5 px-6">Food & Location</th>
                      <th className="py-5 px-6">Donor Details</th>
                      <th className="py-5 px-6">NGO Activity</th>
                      <th className="py-5 px-6">Status & Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-on-surface font-medium">
                    <AnimatePresence mode="popLayout">
                      {filteredListings.length === 0 ? (
                        <motion.tr key="empty-audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan="4" className="py-12 text-center text-on-surface-variant font-bold">No records found.</td>
                        </motion.tr>
                      ) : (
                        filteredListings.map((listing) => (
                          <motion.tr layout variants={rowVariants} initial="hidden" animate="show" exit="exit" key={listing._id} className="group hover:bg-surface-container transition-colors">
                            
                            {/* Food & Location Details */}
                            <td className="py-6 px-6">
                              <div className="flex items-start space-x-3">
                                <div className="bg-surface-bright border border-outline-variant p-2.5 rounded-lg mt-1"><Package className="w-5 h-5 text-on-surface-variant" /></div>
                                <div>
                                  <span className="font-bold text-lg block text-on-surface">{listing.foodName}</span>
                                  <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mt-0.5 mb-1.5">Qty: {listing.quantity}</span>
                                  <div className="flex items-center text-xs text-on-surface-variant font-medium">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {listing.pickupLocation}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Donor Details & Date Posted */}
                            <td className="py-6 px-6">
                              <div className="font-bold text-on-surface mb-1.5">{listing.donorId?.orgName || 'Unknown Donor'}</div>
                              <div className="text-xs text-on-surface-variant flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1" /> 
                                Posted: {new Date(listing.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            {/* NGO Details & Pickup Date */}
                            <td className="py-6 px-6">
                              {listing.claimedBy ? (
                                <div>
                                  <div className="font-bold text-primary mb-1.5">{listing.claimedBy.orgName}</div>
                                  <div className="flex flex-col space-y-1.5">
                                    <span className="text-xs text-on-surface-variant flex items-center">
                                      OTP: <span className="font-mono bg-surface-bright border border-outline-variant px-1.5 py-0.5 rounded ml-1 text-on-surface font-bold">{listing.pickupOtp || 'N/A'}</span>
                                    </span>
                                    {listing.status.toLowerCase() === 'completed' && (
                                      <span className="text-xs font-bold text-secondary flex items-center">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                        Picked: {new Date(listing.updatedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-on-surface-variant text-sm font-medium italic">Unclaimed</span>
                              )}
                            </td>

                            {/* Status & Visibility Flags */}
                            <td className="py-6 px-6">
                              <div className="flex flex-col items-start space-y-2">
                                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                                  listing.status.toLowerCase() === 'completed' ? 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed-dim' :
                                  listing.status.toLowerCase() === 'claimed' ? 'bg-primary-container text-on-primary-container border-primary-fixed-dim' : 'bg-surface-variant text-on-surface border-outline-variant'
                                }`}>
                                  {listing.status}
                                </span>
                                
                                {/* THE AUDIT EXPOSE: Shows if the donor tried to hide it! */}
                                {listing.donorHidden && (
                                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-error bg-error-container px-2 py-1 rounded border border-error" title="Donor soft-deleted this from their history">
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