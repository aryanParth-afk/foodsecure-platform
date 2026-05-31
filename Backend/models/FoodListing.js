const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  // Who posted it?
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // What is it?
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  
  // FIX 1: Removed the strict 'enum' VIP list so it accepts the fallback from server.js
  category: { type: String, default: 'General Food' },
  imageUrl: { type: String, default: '' }, 
  
  // Logistics
  pickupLocation: { type: String, required: true },
  availableSlots: [{ type: String }], 
  
  // Lifecycle Management
  status: { 
    type: String, 
    enum: ['Available', 'Claimed', 'Reserved', 'Completed', 'Expired'], 
    default: 'Available' 
  },
  
  // NEW: Store the secret OTP for secure pickup verification
  pickupOtp: { 
    type: String, 
    default: null 
  },
  
  // Claiming Details
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  selectedPickupSlot: { type: String, default: null } 
  
}, { timestamps: true });

module.exports = mongoose.model('FoodListing', foodListingSchema);