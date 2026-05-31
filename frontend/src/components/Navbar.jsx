import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHeart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Read the user from local storage to know if they are logged in
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth?mode=login');
  };

  return (
    // PROFESSIONAL UPGRADE 1: Glassmorphism (bg-white/80 + backdrop-blur-md)
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left side - Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-orange-50 p-2.5 rounded-2xl border border-orange-100 group-hover:bg-orange-100 transition-colors shadow-sm">
              <HandHeart className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight">FoodRescue</span>
          </Link>

          {/* Right side - Dynamic User Actions */}
          <div className="flex items-center">
            {user ? (
              // PROFESSIONAL UPGRADE 2: Identity & Badges when logged in
              <div className="flex items-center space-x-4 md:space-x-6">
                
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-black text-slate-800">{user.orgName || 'User'}</span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                    user.role === 'SuperAdmin' ? 'bg-amber-100 text-amber-700' :
                    user.role === 'Admin' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'Donor' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="flex items-center px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm group"
                >
                  <span className="hidden sm:block mr-2">Logout</span>
                  <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              /* PROFESSIONAL UPGRADE 3: Clean UI. If they are not logged in, show nothing here! */
              <div />
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;