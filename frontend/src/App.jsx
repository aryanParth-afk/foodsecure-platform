import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HandHeart } from 'lucide-react'; 
import DonorHistory from './components/DonorHistory';

import Navbar from './components/Navbar';
import Profile from './components/Profile';
import BackButton from './components/BackButton';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import NGODashboard from './components/NGODashboard';
import DonorDashboard from './components/DonorDashboard';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-50"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.6 }}
                className="bg-white p-6 rounded-4xl mb-6 shadow-xl shadow-orange-100 border border-orange-50"
              >
                <HandHeart className="w-20 h-20 text-orange-500" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-600 tracking-tight"
              >
                FoodRescue
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Router>
        <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-orange-50/50 via-slate-50 to-emerald-50/30 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                padding: '16px 24px',
                borderRadius: '1rem',
                fontWeight: '800',
                fontSize: '15px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                maxWidth: '500px',
              },
              error: {
                style: {
                  background: '#fff1f2', 
                  border: '2px solid #ffe4e6',
                  color: '#e11d48', 
                },
                iconTheme: {
                  primary: '#e11d48',
                  secondary: '#ffffff',
                },
              },
              success: {
                style: {
                  background: '#ecfdf5', 
                  border: '2px solid #d1fae5',
                  color: '#059669', 
                },
                iconTheme: {
                  primary: '#059669',
                  secondary: '#ffffff',
                },
              },
            }} 
          />
          
          {/* THE NEW SMART BACK BUTTON */}
          <BackButton />
          
          <Navbar />
          <div className="pt-8 pb-12">
            <Routes>
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/ngo-dashboard" element={<ProtectedRoute requiredRole="NGO"><NGODashboard /></ProtectedRoute>} />
              <Route path="/donor-dashboard" element={<ProtectedRoute requiredRole="Donor"><DonorDashboard /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute requiredRole="Donor"><DonorHistory /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute requiredRole="Admin"><AnalyticsDashboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
};

export default App;