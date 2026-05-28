import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // NEW: Dynamic environment variable mapping
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to sync live analytics.");
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-bold">Syncing live database metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 overflow-hidden">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Intelligence</h1>
        </div>
        <p className="text-gray-500 font-medium ml-14">Real-time metrics and network impact analysis.</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
        
        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border-2 border-gray-50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Total Meals Saved</p>
                <h3 className="text-4xl font-black text-gray-900">{data.metrics.totalMeals.toLocaleString()}<span className="text-emerald-500 text-2xl">+</span></h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border-2 border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Active Donors</p>
                {/* LIVE DATA HERE */}
                <h3 className="text-4xl font-black text-blue-600">{data.metrics.totalDonors}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border-2 border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Registered NGOs</p>
                {/* LIVE DATA HERE */}
                <h3 className="text-4xl font-black text-orange-600">{data.metrics.totalNGOs}</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl"><Users className="w-6 h-6 text-orange-600" /></div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border-2 border-gray-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Monthly Growth</p>
                <h3 className="text-4xl font-black text-gray-900">{data.metrics.growth}<span className="text-purple-500 text-2xl">%</span></h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl"><Package className="w-6 h-6 text-purple-600" /></div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={cardVariants} className="lg:col-span-2 bg-white p-8 rounded-4xl border-2 border-gray-50 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Food Rescue Volume (6 Months)</h3>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMeals)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white p-8 rounded-4xl border-2 border-gray-50 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Distribution by Category</h3>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.foodTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;