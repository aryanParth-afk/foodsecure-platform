import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button on the main Landing Page and Dashboard pages
  const hiddenPaths = ['/', '/ngo-dashboard', '/donor-dashboard', '/admin'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  return (
    <AnimatePresence>
      {!shouldHide && (
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={() => navigate(-1)}
          className="fixed top-24 left-4 md:left-8 z-40 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackButton;