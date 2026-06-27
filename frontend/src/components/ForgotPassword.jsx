import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Mail, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      // Uses the success message sent directly from your Nodemailer backend!
      toast.success(response.data.message || "Reset link sent to your email!"); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest ink-border soft-elevation p-8 rounded-xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>

        <div className="bg-surface-container w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto border border-outline-variant shadow-sm">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="font-display-lg text-3xl text-on-surface text-center mb-2 tracking-tight">Forgot Password?</h2>
        <p className="text-on-surface-variant text-center font-body-md text-sm mb-8 px-4">
          Enter your registered email address and we'll send you a secure link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="w-5 h-5 text-on-surface-variant absolute left-4 top-3.5 group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg py-3 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm" 
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 shadow-sm mt-2">
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Send className="w-4 h-4 mr-2" /> Send Reset Link</>}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-outline-variant">
          <Link to="/auth?mode=login" className="text-sm font-bold text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;