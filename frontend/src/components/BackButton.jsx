import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If the user is on the main landing page, hide the button completely!
  if (location.pathname === '/') return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(-1)} // The "-1" tells React Router to go back one step in history
      className="fixed top-6 left-4 md:left-8 z-50 flex items-center justify-center p-3 md:px-4 md:py-2.5 bg-white/90 backdrop-blur-md border border-gray-200 text-slate-700 rounded-2xl shadow-lg hover:bg-slate-900 hover:text-white transition-colors group cursor-pointer"
    >
      <ArrowLeft className="w-5 h-5 md:mr-2 group-hover:-translate-x-1 transition-transform" />
      <span className="hidden md:block font-bold text-sm">Back</span>
    </motion.button>
  );
};

export default BackButton;