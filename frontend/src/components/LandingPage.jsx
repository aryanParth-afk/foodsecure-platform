import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, HeartHandshake, ShieldCheck, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const LandingPage = () => {
  const [stats, setStats] = useState({ savedMeals: 0, donors: 0, ngos: 0 });
  const [currentIssue, setCurrentIssue] = useState(0);
  const navigate = useNavigate(); 
  
  const issues = [
    "Issue No. 04 — The Culinary Waste Revolution",
    "Issue No. 05 — Sustainable Urban Logistics",
    "Issue No. 06 — Empowering Local Communities",
    "Issue No. 07 — Zero Waste Initiatives"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIssue(prev => (prev + 1) % issues.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [issues.length]);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role === 'NGO') return navigate('/ngo-dashboard');
      if (user.role === 'Donor') return navigate('/donor-dashboard');
      if (user.role === 'Admin' || user.role === 'SuperAdmin') return navigate('/admin-dashboard');
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

  return (
    <div className="bg-surface-bright text-on-surface font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed pt-20">
      
      {/* Hero Section: Editorial Layout */}
      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-24 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="md:col-span-6 order-2 md:order-1 relative">
            <div className="h-6 mb-4 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentIssue}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-primary font-label-md uppercase tracking-widest block italic absolute"
                >
                  {issues[currentIssue]}
                </motion.span>
              </AnimatePresence>
            </div>
            <h1 className="font-display-lg text-5xl md:text-display-lg text-on-surface leading-tight tracking-tight mb-6">
              Stop <span className="italic font-normal">Food Waste</span>. Start <span className="italic font-normal">Feeding People</span>.
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto md:mx-0 mb-10">
              We connect local restaurants and bakeries with charities. Together, we turn surplus food into meals for those in need, ensuring good food never goes to waste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#ecosystem" className="bg-primary text-center text-on-primary px-8 py-4 font-label-md uppercase tracking-wider hover:bg-on-primary-fixed-variant transition-colors rounded-lg">Start Rescue Mission</a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="md:col-span-6 order-1 md:order-2 mb-8 md:mb-0">
            <div className="relative group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl">
                <img 
                  alt="High-end culinary waste revolution"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 hidden md:block bg-surface-container-lowest p-8 ink-border max-w-[240px] soft-elevation rounded-xl">
                <p className="font-headline-sm text-headline-sm text-primary mb-2">94%</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">Waste reduction efficiency among partners.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Transparency Ticker */}
      <section className="bg-on-secondary-fixed text-surface-bright py-4 overflow-hidden my-12">
        <div className="ticker-wrap flex items-center">
          <div className="ticker flex gap-12 font-label-md uppercase tracking-[0.2em] whitespace-nowrap">
            <span>Live Impact Tracker</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.donors}+ Donors Partnered</span><span className="text-primary-container mx-8">•</span>
            <span>Live Impact Tracker</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.donors}+ Donors Partnered</span><span className="text-primary-container mx-8">•</span>
            <span>Live Impact Tracker</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container mx-8">•</span>
            <span>{stats.donors}+ Donors Partnered</span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Portals & Impact */}
      <motion.section 
        id="ecosystem"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-24"
      >
        <div className="mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg mb-4 italic">The Rescue Ecosystem</h2>
          <div className="h-px w-24 bg-primary mx-auto mb-6"></div>
          <p className="font-body-md text-on-surface-variant uppercase tracking-widest max-w-lg mx-auto">Select your entry point into the transparency-first food recovery network.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* NGO Portal */}
          <motion.div className="p-8 group flex flex-col h-full glass-panel glass-panel-hover">
            <Building2 className="text-secondary w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4">NGO Portal</h3>
            <p className="font-body-md text-on-surface-variant mb-8 flex-grow">A simple dashboard for charities and shelters. See available food nearby, claim donations, and track your pickups easily.</p>
            <Link to="/auth?role=NGO" className="font-label-md text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {/* Donor Portal (Featured) */}
          <motion.div className="bg-on-secondary-fixed text-surface-bright p-8 group shadow-xl transition-all flex flex-col h-full rounded-2xl hover:-translate-y-1 hover:shadow-2xl">
            <HeartHandshake className="text-primary-container w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4 text-white">Donor Portal</h3>
            <p className="font-body-lg text-surface-variant mb-8 flex-grow">For restaurants, bakeries, and food businesses. Schedule a pickup in under a minute and track the positive impact you're making.</p>
            <Link to="/auth?role=Donor" className="font-label-md text-primary-container uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Partner With Us <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {/* Admin Portal */}
          <motion.div className="p-8 group flex flex-col h-full glass-panel glass-panel-hover">
            <ShieldCheck className="text-secondary w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4">Admin Portal</h3>
            <p className="font-body-md text-on-surface-variant mb-8 flex-grow">Oversee the platform. Approve new users, monitor donations, and keep our community safe and transparent.</p>
            <Link to="/auth?role=Admin" className="font-label-md text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Enter Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="bg-surface-container py-12 md:py-24"
      >
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-12 items-stretch">
            <div className="md:w-5/12">
              <div className="sticky top-32">
                <h2 className="font-display-lg text-4xl md:text-headline-lg mb-8 leading-tight">About <span className="text-primary italic">FoodRescue</span>.</h2>
                <p className="font-body-lg text-on-surface-variant mb-4">Every day, perfectly good food is thrown away by restaurants while millions go hungry. We believe this is a logistics problem we can solve together.</p>
                <p className="font-body-lg text-on-surface-variant mb-8">Our platform makes it incredibly simple for local businesses to donate their unsold food to nearby NGOs and shelters.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">01</span>
                    <span className="font-label-md uppercase">Donors Post Food</span>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">02</span>
                    <span className="font-label-md uppercase">NGOs Claim It Instantly</span>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">03</span>
                    <span className="font-label-md uppercase">Meals Are Delivered</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-7/12 space-y-8 md:space-y-gutter-desktop">
              <div className="aspect-video relative group overflow-hidden rounded-2xl mb-8">
                <img 
                  alt="Volunteer handing out food"
                  className="w-full h-full object-cover rounded-2xl md:rounded-l-3xl shadow-2xl" 
                  src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="aspect-video relative group overflow-hidden rounded-2xl mb-8 hidden md:block">
                <img 
                  alt="Community coming together"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-1000" 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-gutter-desktop">
                <div className="aspect-square bg-surface-container-highest flex items-center justify-center p-4 md:p-8 text-center ink-border rounded-2xl">
                  <div>
                    <p className="font-headline-sm text-3xl md:text-headline-sm mb-2 text-on-surface">Zero</p>
                    <p className="font-label-sm text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider">Tolerance For Waste</p>
                  </div>
                </div>
                <div className="aspect-square bg-primary text-on-primary flex items-center justify-center p-4 md:p-8 text-center rounded-2xl glass-panel-hover shadow-lg">
                  <div>
                    <p className="font-headline-sm text-3xl md:text-headline-sm mb-2 text-white">
                      <AnimatedCounter value={2.5} decimals={1} suffix="M" duration={2.5} />
                    </p>
                    <p className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-primary-fixed">Meals Delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer / CTA */}
      <footer className="bg-surface-container-highest border-t border-outline-variant text-on-surface">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            
            {/* Brand and Description */}
            <div className="md:col-span-4 space-y-6">
              <span className="font-headline-lg text-3xl uppercase tracking-tighter text-primary">FoodRescue</span>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                Transforming food surplus into social impact. Connecting communities, eliminating waste, and feeding the future.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="p-2 bg-surface-container rounded-full hover:bg-primary hover:text-on-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="p-2 bg-surface-container rounded-full hover:bg-primary hover:text-on-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="p-2 bg-surface-container rounded-full hover:bg-primary hover:text-on-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4 md:pl-12 space-y-6">
              <h4 className="font-headline-sm text-lg uppercase tracking-wider">Platform</h4>
              <ul className="space-y-4">
                <li><a href="/#about" className="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4"/> About Us</a></li>
                <li><Link to="/auth?role=NGO" className="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4"/> NGO Portal</Link></li>
                <li><Link to="/auth?role=Donor" className="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Donor Portal</Link></li>
                <li><Link to="/auth?role=Admin" className="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4"/> Admin Portal</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-4 space-y-6">
              <h4 className="font-headline-sm text-lg uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-body-md text-on-surface-variant">+91 7479657488</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:aryan10c112077@gmail.com" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">support@foodsecure.com</a>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/50 gap-4">
            <p className="font-label-sm text-on-surface-variant/70 uppercase tracking-widest">© 2024 FoodRescue Platform. All rights reserved.</p>
            <div className="flex gap-6 font-label-sm text-on-surface-variant/70 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;