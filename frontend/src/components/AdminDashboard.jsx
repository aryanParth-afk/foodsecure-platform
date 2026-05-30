import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, XCircle, UserPlus, UserMinus, Building2, HeartHandshake, ShieldAlert, Crown, Search, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'SuperAdmin';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load user data.");
        setLoading(false);
      }
    };
    fetchUsers();
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
    } catch (error) {
      toast.error("Failed to elevate user.");
    }
  };

  const handleDemoteAdmin = async (userId, orgName) => {
    if (!isSuperAdmin) return; 
    if (!window.confirm(`Revoke Admin rights from "${orgName}"?`)) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/demote`);
      toast.success(`${orgName} has been demoted.`);
      // FIX: Tell React UI to instantly change the badge to 'Revoked' instead of 'Donor'
      setUsers(users.map(u => u._id === userId ? { ...u, role: 'Revoked' } : u));
    } catch (error) {
      toast.error("Failed to revoke admin rights.");
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const rowVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const filteredUsers = users.filter(user => user.orgName?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl shadow-sm ${isSuperAdmin ? 'bg-amber-100' : 'bg-slate-100'}`}>
            {isSuperAdmin ? <Crown className="w-8 h-8 text-amber-600" /> : <Shield className="w-8 h-8 text-slate-800" />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {isSuperAdmin ? "SuperAdmin Control" : "Verification Center"}
            </h1>
            <p className="text-gray-500 font-medium mt-1">Manage platform access and security levels.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-72">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" placeholder="Search organizations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl py-3 pl-12 pr-4 focus:border-orange-500 focus:ring-0 outline-none transition-all shadow-sm font-medium" 
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white border border-gray-100 rounded-4xl shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest">
                <th className="py-5 px-6">Organization</th>
                <th className="py-5 px-6">Classification</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
              {filteredUsers.map((user) => (
                <motion.tr variants={rowVariants} key={user._id} className={`group transition-all duration-300 hover:shadow-md relative ${user.role === 'SuperAdmin' ? 'bg-amber-50/20' : user.role === 'Admin' ? 'bg-blue-50/20' : user.role === 'Revoked' ? 'bg-rose-50/10 opacity-75' : 'hover:bg-white'}`}>
                  
                  <td className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-orange-400 to-orange-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></td>

                  <td className="py-6 px-6 flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${user.role === 'SuperAdmin' ? 'bg-amber-100' : user.role === 'Admin' ? 'bg-blue-100' : user.role === 'Donor' ? 'bg-emerald-100' : user.role === 'Revoked' ? 'bg-rose-100' : 'bg-orange-100'}`}>
                      {/* ADDED: special icon for Revoked users */}
                      {user.role === 'SuperAdmin' ? <Crown className="w-5 h-5 text-amber-600" /> : user.role === 'Admin' ? <ShieldAlert className="w-5 h-5 text-blue-600" /> : user.role === 'Donor' ? <HeartHandshake className="w-5 h-5 text-emerald-600" /> : user.role === 'Revoked' ? <Ban className="w-5 h-5 text-rose-600" /> : <Building2 className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <span className={`font-bold text-lg block ${user.role === 'Revoked' ? 'text-gray-500 line-through decoration-rose-300' : 'text-gray-900'}`}>{user.orgName || 'Unnamed Entity'}</span>
                      <span className="text-sm text-gray-400 font-medium block mt-0.5">{user.email}</span>
                    </div>
                  </td>

                  <td className="py-6 px-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      user.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' : user.role === 'Admin' ? 'bg-blue-100 text-blue-700' : user.role === 'Donor' ? 'bg-emerald-50 text-emerald-700' : user.role === 'Revoked' ? 'bg-rose-100 text-rose-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-6 px-6">
                    {user.role === 'SuperAdmin' || user.role === 'Admin' ? (
                       <span className="text-slate-500 font-bold text-sm">System Override</span>
                    ) : user.role === 'Revoked' ? (
                       <span className="text-rose-500 font-bold text-sm flex items-center"><Ban className="w-4 h-4 mr-1.5"/> Locked Out</span>
                    ) : user.isVerified ? (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border border-blue-100">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-400 px-3 py-1.5 text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1.5" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="py-6 px-6 text-center">
                    {user.role === 'SuperAdmin' ? (
                      <span className="text-sm font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                        SUPREME MASTER
                      </span>
                    ) : user.role === 'Admin' ? (
                      isSuperAdmin ? (
                        <button onClick={() => handleDemoteAdmin(user._id, user.orgName)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-gray-100 hover:border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center mx-auto space-x-1.5 transition-all shadow-sm">
                          <UserMinus className="w-4 h-4" /><span>Revoke Admin</span>
                        </button>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">Co-Administrator</span>
                      )
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        {/* Only show verify button if not revoked */}
                        {user.role !== 'Revoked' && (
                          <button onClick={() => handleToggleVerify(user._id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${user.isVerified ? 'bg-white border-2 border-gray-100 hover:border-rose-200 text-rose-600 hover:bg-rose-50' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 shadow-lg hover:-translate-y-0.5'}`}>
                            {user.isVerified ? 'Revoke Badge' : 'Grant Badge'}
                          </button>
                        )}
                        
                        {isSuperAdmin && (
                          <button onClick={() => handlePromoteAdmin(user._id, user.orgName)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 transition-all shadow-sm hover:-translate-y-0.5">
                            <UserPlus className="w-4 h-4" /><span>{user.role === 'Revoked' ? 'Restore Admin' : 'Make Admin'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;