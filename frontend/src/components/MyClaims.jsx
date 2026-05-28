import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Using the environment variable for production URL, falling back to localhost for local testing
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/listings/claimed`);
        setClaims(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claims:", error);
        setLoading(false);
      }
    };
    fetchClaims();
  }, [apiUrl]);

  // Function to handle canceling a claim
  const handleCancelClaim = async (id) => {
    try {
      // 1. Tell backend to change status back to 'Active'
      await axios.patch(`${apiUrl}/api/listings/${id}/cancel`);
      
      // 2. Instantly remove it from the My Claims screen
      setClaims(claims.filter(item => item._id !== id));
    } catch (error) {
      console.error("Error canceling claim:", error);
      alert("Failed to cancel claim. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-500 animate-pulse">Loading your claims...</p>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 px-4">
        <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No claims yet!</h2>
        <p className="text-gray-500">Items you claim from the Live Feed will appear here for pickup.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Ready for Pickup</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claims.map((item) => (
          <div key={item._id} className="bg-green-50 rounded-2xl shadow-sm border border-green-200 overflow-hidden flex flex-col">
            <div className="p-6 grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.foodName}</h3>
                <CheckCircle className="text-green-600 w-6 h-6 shrink-0 ml-2" />
              </div>
              
              <div className="bg-white rounded-lg p-3 mb-4 border border-green-100 shadow-sm">
                <p className="text-gray-700 font-medium">Quantity: <span className="font-bold">{item.quantity}</span></p>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-2 text-green-600 shrink-0" />
                <span className="font-medium">Pickup at: {item.pickupLocation}</span>
              </div>
            </div>
            
            {/* The new Cancel Button at the bottom of the card */}
            <div className="px-6 pb-6 mt-auto">
              <button 
                onClick={() => handleCancelClaim(item._id)}
                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold py-2 px-4 rounded-xl transition-colors flex justify-center items-center group"
              >
                <XCircle className="w-4 h-4 mr-2 text-red-400 group-hover:text-red-600 transition-colors" />
                Cancel Claim
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClaims;