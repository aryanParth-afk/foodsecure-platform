import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MapPin, Utensils } from 'lucide-react';

const LiveFeed = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to handle clicking the Claim button
  const handleClaim = async (id) => {
    try {
      // 1. Tell the backend to update the database
      await axios.patch(`http://localhost:5001/api/listings/${id}/claim`);
      
      // 2. Instantly remove that specific item from the React screen
      setListings(listings.filter(item => item._id !== id));
    } catch (error) {
      console.error("Error claiming food:", error);
      alert("Failed to claim donation. Please try again.");
    }
  };

  useEffect(() => {
    // Fetch data from your active Node.js backend
    const fetchListings = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/listings');
        setListings(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-500 animate-pulse">Loading Live Feed...</p>
      </div>
    );
  }

  // The Empty State (What you will see since your database is currently empty)
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="text-orange-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No food listings available right now</h2>
          <p className="text-gray-500 mb-6">There are currently no active donations in your area. Please check back later!</p>
        </div>
      </div>
    );
  }

  // The Active Feed (What you will see once we add data)
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Live Availability Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.foodName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${item.category === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.category}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                <p className="text-gray-700 font-medium">Quantity: <span className="font-bold">{item.quantity}</span></p>
              </div>
              
              <div className="flex items-center text-orange-600 text-sm mb-2 font-semibold">
                <Clock className="w-4 h-4 mr-2" />
                <span>Expires in: 2h 15m</span> {/* Mock countdown for UI purposes */}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="truncate">{item.pickupLocation || "Location hidden"}</span>
              </div>
              
              <button 
                onClick={() => handleClaim(item._id)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex justify-center items-center cursor-pointer active:scale-95"
              >
                Claim Donation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;