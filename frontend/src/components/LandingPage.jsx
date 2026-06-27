import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="bg-surface-bright text-on-surface font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed pt-20 pb-16">
      
      {/* Hero Section: Editorial Layout */}
      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-24 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="md:col-span-6 order-2 md:order-1">
            <span className="text-primary font-label-md uppercase tracking-widest mb-4 block italic">Issue No. 04 — The Culinary Waste Revolution</span>
            <h1 className="font-display-lg text-4xl md:text-display-lg leading-tight mb-8">Elevating surplus to <span className="italic text-primary">superlative.</span></h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
              A curated alliance of culinary artisans and conscious residents. We transform premium surplus into social impact, ensuring no masterpiece goes untasted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="bg-primary text-center text-on-primary px-8 py-4 font-label-md uppercase tracking-wider hover:bg-on-primary-fixed-variant transition-colors rounded-lg">Start Rescue Mission</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="md:col-span-6 order-1 md:order-2 mb-8 md:mb-0">
            <div className="relative group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl">
                <img 
                  alt="High-end culinary waste revolution"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80"
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
            <span>Live Impact Tracker</span><span className="text-primary-container">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container">•</span>
            <span>{stats.donors}+ Donors Partnered</span><span className="text-primary-container">•</span>
            <span>Live Impact Tracker</span><span className="text-primary-container">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container">•</span>
            <span>{stats.donors}+ Donors Partnered</span><span className="text-primary-container">•</span>
            <span>Live Impact Tracker</span><span className="text-primary-container">•</span>
            <span>{stats.savedMeals}+ kg Rescued</span><span className="text-primary-container">•</span>
            <span>{stats.ngos}+ NGOs Active</span><span className="text-primary-container">•</span>
            <span>{stats.donors}+ Donors Partnered</span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Portals & Impact */}
      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-24">
        <div className="mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg mb-4 italic">The Rescue Ecosystem</h2>
          <div className="h-px w-24 bg-primary mx-auto mb-6"></div>
          <p className="font-body-md text-on-surface-variant uppercase tracking-widest max-w-lg mx-auto">Select your entry point into the transparency-first food recovery network.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* NGO Portal */}
          <motion.div whileHover={{ y: -5 }} className="bg-surface-container-lowest p-8 ink-border group soft-elevation transition-all flex flex-col h-full rounded-2xl">
            <Building2 className="text-secondary w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4">NGO Portal</h3>
            <p className="font-body-md text-on-surface-variant mb-8 flex-grow">A streamlined management dashboard for high-capacity distribution centers. Track real-time inventory and logistics.</p>
            <Link to="/auth" className="font-label-md text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {/* Donor Portal (Featured) */}
          <motion.div whileHover={{ y: -5 }} className="bg-on-secondary-fixed text-surface-bright p-8 group shadow-xl transition-all flex flex-col h-full rounded-2xl">
            <HeartHandshake className="text-primary-container w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4 text-white">Donor Portal</h3>
            <p className="font-body-lg text-surface-variant mb-8 flex-grow">For restaurants, bakeries, and purveyors. Schedule pickups in 60 seconds and access tax compliance instantly.</p>
            <Link to="/auth" className="font-label-md text-primary-container uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Partner With Us <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {/* Admin Portal */}
          <motion.div whileHover={{ y: -5 }} className="bg-surface-container-lowest p-8 ink-border group soft-elevation transition-all flex flex-col h-full rounded-2xl">
            <ShieldCheck className="text-secondary w-10 h-10 mb-6" />
            <h3 className="font-headline-sm text-headline-sm mb-4">Admin Portal</h3>
            <p className="font-body-md text-on-surface-variant mb-8 flex-grow">Deep dives into the data. Verify new users and manage operations. Audited transparency.</p>
            <Link to="/auth" className="font-label-md text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
              Enter Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Story Section */}
      <section className="bg-surface-container py-12 md:py-24">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-12 items-stretch">
            <div className="md:w-5/12">
              <div className="sticky top-32">
                <h2 className="font-display-lg text-4xl md:text-headline-lg mb-8 leading-tight">The <span className="text-primary italic">Geometry</span> of Giving.</h2>
                <p className="font-body-lg text-on-surface-variant mb-8">Sustainability is not just a practice; it is an art form. We apply rigorous design thinking to the logistical problem of food waste, creating a frictionless loop of luxury and responsibility.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">01</span>
                    <span className="font-label-md uppercase">Curated Sourcing</span>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">02</span>
                    <span className="font-label-md uppercase">Rapid Cold-Chain Transfer</span>
                  </div>
                  <div className="flex items-center gap-4 py-4 border-b border-outline-variant">
                    <span className="font-headline-sm text-primary">03</span>
                    <span className="font-label-md uppercase">Dignified Distribution</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-7/12 space-y-8 md:space-y-gutter-desktop">
              <div className="aspect-video relative group overflow-hidden rounded-2xl">
                <img 
                  alt="Delivery"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-1000" 
                  src="https://images.unsplash.com/photo-1594282486552-05b4d70fbb92?auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-gutter-desktop">
                <div className="aspect-square bg-surface-container-highest flex items-center justify-center p-4 md:p-8 text-center ink-border rounded-2xl">
                  <div>
                    <p className="font-headline-sm text-3xl md:text-headline-sm mb-2 text-on-surface">500+</p>
                    <p className="font-label-sm text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider">Premium Partners</p>
                  </div>
                </div>
                <div className="aspect-square bg-primary text-on-primary flex items-center justify-center p-4 md:p-8 text-center rounded-2xl">
                  <div>
                    <p className="font-headline-sm text-3xl md:text-headline-sm mb-2 text-white">2.5M</p>
                    <p className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-primary-fixed">Meals Delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="bg-surface-container-highest border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-gutter-desktop">
          <div className="flex flex-col md:flex-row justify-between items-center gap-base mb-12">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <span className="font-headline-sm text-on-surface uppercase tracking-tighter">RESCUE</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/auth" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">NGO Portal</Link>
              <Link to="/auth" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Donor Portal</Link>
            </div>
          </div>
          <div className="text-center md:text-left pt-8 border-t border-outline-variant/30">
            <p className="font-label-sm text-on-surface-variant/70 uppercase tracking-widest">© 2024 RESCUE Platform. Editorial Responsibility & Transparency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;