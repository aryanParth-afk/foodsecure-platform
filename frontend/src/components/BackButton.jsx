import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ADDED '/auth' to the hidden paths so it doesn't duplicate the button on the login card!
  const hiddenPaths = ['/', '/ngo-dashboard', '/donor-dashboard', '/admin', '/auth'];
  
  // Also check if the path starts with these, just in case there are URL parameters
  const shouldHide = hiddenPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '?'));

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