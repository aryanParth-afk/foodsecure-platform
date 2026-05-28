import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHeart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'SuperAdmin': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'NGO': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Donor': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'NGO') return '/ngo-dashboard';
    if (user.role === 'Donor') return '/donor-dashboard';
    if (user.role === 'Admin' || user.role === 'SuperAdmin') return '/admin';
    return '/';
  };

  return (
    // Clean, white frosted glass navbar
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <Link to={getHomeLink()} className="flex items-center space-x-2 group">
          <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl group-hover:bg-orange-100 transition-colors shadow-sm">
            <HandHeart className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">FoodRescue</span>
        </Link>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              
              {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                <Link to="/analytics" className="px-4 py-2 mr-2 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  Analytics
                </Link>
              )}

              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm leading-tight">{user.orgName}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider mt-1 ${getRoleBadge(user.role)}`}>
                  {user.role}
                </div>
              </div>
              
              <div className="bg-slate-50 p-2 rounded-full border border-slate-200 shadow-sm">
                <User className="w-5 h-5 text-slate-600" />
              </div>

              <button onClick={handleLogout} className="ml-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors group">
                <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="px-6 py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:shadow-lg">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;