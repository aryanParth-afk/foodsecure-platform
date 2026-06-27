const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  // Who posted it?
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // What is it?
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  category: { type: String, default: 'General Food' },
  imageUrl: { type: String, default: '' }, 
  
  // Logistics
  pickupLocation: { type: String, required: true },
  
  // NEW: Expiration system
  expiresAt: { type: Date },

  // NEW: Coordinates for Mapbox Integration
  lat: { type: Number },
  lng: { type: Number },

  availableSlots: [{ type: String }], 
  
  // Lifecycle Management
  status: { 
    type: String, 
    enum: ['Available', 'Claimed', 'Reserved', 'Completed', 'Expired'], 
    default: 'Available' 
  },
  
  // Security
  pickupOtp: { type: String, default: null },
  
  // Claiming Details
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  selectedPickupSlot: { type: String, default: null },
  
  // Allows Donors to remove history from UI without resetting all-time counters
  donorHidden: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('FoodListing', foodListingSchema);