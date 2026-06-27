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
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import NgoMapDashboard from './components/NgoMapDashboard';

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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.6 }}
                className="bg-emerald-500/20 p-6 rounded-4xl mb-6 shadow-xl shadow-emerald-500/20 border border-emerald-500/30"
              >
                <HandHeart className="w-20 h-20 text-emerald-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight"
              >
                FoodRescue
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Router>
        {/* Wrapper for the new Editorial Impact theme */}
        <div className="relative min-h-screen bg-surface-bright text-on-surface z-0 selection:bg-primary-fixed selection:text-on-primary-fixed">
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
          
          <BackButton />
          
          <Navbar />
          
          {/* UPDATED MOBILE PADDING: pb-28 gives enough space for the mobile nav bar, md:pb-12 keeps desktop normal */}
          <main className="pt-8 pb-28 md:pb-12 relative z-10">
            <Routes>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/ngo-dashboard" element={<ProtectedRoute requiredRole="NGO"><NGODashboard /></ProtectedRoute>} />
              <Route path="/donor-dashboard" element={<ProtectedRoute requiredRole="Donor"><DonorDashboard /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute requiredRole="Donor"><DonorHistory /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute requiredRole="Admin"><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/ngo-map" element={<NgoMapDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
};

export default App;