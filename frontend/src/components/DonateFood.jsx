import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LocationPicker from './LocationPicker'; // <-- IMPORTED YOUR MAP COMPONENT

const DonateFood = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    category: 'Veg',
    pickupLocation: '',
    lat: null, // <-- ADDED FOR MAPBOX
    lng: null, // <-- ADDED FOR MAPBOX
    hoursUntilExpiry: '2'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // <-- NEW FUNCTION: Updates state when donor drops a pin on the map
  const handleLocationSelect = (address, selectedLat, selectedLng) => {
    setFormData({
      ...formData,
      pickupLocation: address,
      lat: selectedLat,
      lng: selectedLng
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // Validation
    if (formData.foodName.trim().length < 3) {
      return toast.error("Food name must be at least 3 characters long.");
    }
    if (/-\d/.test(formData.quantity)) {
      return toast.error("Quantity cannot contain negative numbers.");
    }
    if (formData.quantity.trim().length === 0) {
      return toast.error("Please provide a valid quantity.");
    }
    if (formData.pickupLocation.trim().length < 5) {
      return toast.error("Please provide a more specific pickup location.");
    }
    // <-- NEW: Ensure coordinates are captured before submitting
    if (!formData.lat || !formData.lng) {
      return toast.error("Please select your exact pickup location on the map.");
    }

    const hours = Number(formData.hoursUntilExpiry);
    if (hours < 1 || hours > 72) {
      return toast.error("Expiry time must be between 1 and 72 hours.");
    }

    const loadingToast = toast.loading('Publishing donation...');
    const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    const dataToSend = { ...formData, expiryTime: expiryDate };

    try {
      // <-- UPDATED: Uses dynamic environment URL and points to the right route
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/foodlistings`, dataToSend);
      
      toast.dismiss(loadingToast);
      toast.success('Donation successfully posted!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error('Failed to post donation.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-10 mt-10 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Post a Donation</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Food Item Name</label>
          <input type="text" name="foodName" required value={formData.foodName} onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., 5 Boxes of Pasta" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
            <input type="text" name="quantity" required value={formData.quantity} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., 5 kgs" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {/* <-- REPLACED THE TEXT INPUT WITH YOUR LOCATION PICKER --> */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Location</label>
          {/* Note: Check your LocationPicker.jsx to ensure it accepts an 'onSelect' or similar prop to pass data back up! */}
          <LocationPicker onSelect={handleLocationSelect} />
          
          {/* Optional: Show the selected text address below the map for confirmation */}
          {formData.pickupLocation && (
            <p className="text-xs text-gray-500 mt-2">Selected: {formData.pickupLocation}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Expires In (Hours)</label>
          <input type="number" name="hoursUntilExpiry" required value={formData.hoursUntilExpiry} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4">
          Publish Donation
        </button>
      </form>
    </div>
  );
};

export default DonateFood;