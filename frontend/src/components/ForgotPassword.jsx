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
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md border border-slate-100 p-8 rounded-4xl shadow-xl shadow-slate-200/50">
        
        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
          <KeyRound className="w-8 h-8 text-orange-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Forgot Password?</h2>
        <p className="text-slate-500 text-center text-sm font-medium mb-8">
          Enter your registered email address and we'll send you a secure link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl py-3 pl-12 pr-4 focus:border-orange-500 focus:bg-white outline-none font-bold" 
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70">
            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Send className="w-4 h-4 mr-2" /> Send Reset Link</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/auth?mode=login" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;