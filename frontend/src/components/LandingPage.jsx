import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { HandHeart, HeartHandshake, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [stats, setStats] = useState({ savedMeals: 0, donors: 0, ngos: 0 });
  const navigate = useNavigate(); 

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role === 'NGO') return navigate('/ngo-dashboard');
      if (user.role === 'Donor') return navigate('/donor-dashboard');
      if (user.role === 'Admin' || user.role === 'SuperAdmin') return navigate('/admin');
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load stats");
      }
    };
    fetchStats();
  }, [navigate]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden relative pb-16">
      
      {/* Soft ambient background glows */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-orange-300/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-emerald-300/20 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center mb-12 relative z-10 mt-10">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-white p-4 rounded-2xl mr-4 shadow-lg shadow-orange-100 border border-orange-50">
             <HandHeart className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-700 tracking-tight pb-2">
            FoodRescue
          </h1>
        </div>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Bridging the gap between surplus food and communities in need.
        </p>
      </motion.div>

      {/* Floating White Stats Bar */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5, type: "spring" }} 
        className="bg-white border border-gray-100 rounded-4xl py-5 px-10 mb-16 shadow-xl shadow-gray-200/50 relative z-10"
      >
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-slate-800 font-black text-xl tracking-wide">
          <div className="flex items-center"><span className="text-emerald-500 font-bold mr-3 uppercase text-sm tracking-widest">Saved Meals</span> {stats.savedMeals}+</div>
          <div className="hidden md:block text-gray-200">|</div>
          <div className="flex items-center"><span className="text-blue-500 font-bold mr-3 uppercase text-sm tracking-widest">Donors</span> {stats.donors}+</div>
          <div className="hidden md:block text-gray-200">|</div>
          <div className="flex items-center"><span className="text-orange-500 font-bold mr-3 uppercase text-sm tracking-widest">NGOs</span> {stats.ngos}+</div>
        </div>
      </motion.div>

      {/* Sleek Bento-Box Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
        
        <motion.div variants={itemVariants}>
          <Link to="/auth?mode=register&role=NGO" className="group h-full bg-white border border-gray-100 hover:border-orange-200 rounded-4xl p-8 transition-all hover:shadow-2xl hover:shadow-orange-100 hover:-translate-y-2 flex flex-col text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 to-orange-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3">NGO Portal</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Create an organization account to claim surplus food donations and distribute them.</p>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link to="/auth?mode=register&role=Donor" className="group h-full bg-white border border-gray-100 hover:border-emerald-200 rounded-4xl p-8 transition-all hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-2 flex flex-col text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-emerald-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <HeartHandshake className="w-8 h-8 text-emerald-600" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">Donor Portal</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Join the network to post your excess food inventory and schedule seamless pickups.</p>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link to="/auth?mode=register&role=Admin" className="group h-full bg-white border border-gray-100 hover:border-blue-200 rounded-4xl p-8 transition-all hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 flex flex-col text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">Admin Portal</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Secure registration for platform administrators to verify NGOs and manage users.</p>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LandingPage;