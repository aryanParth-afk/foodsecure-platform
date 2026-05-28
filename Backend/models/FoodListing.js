const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  // Who posted it?
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // What is it?
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  category: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  imageUrl: { type: String }, // NEW: Ready for image uploads!
  
  // Logistics
  pickupLocation: { type: String, required: true },
  availableSlots: [{ type: String }], // NEW: Array of time slots e.g., ["08:00 - 09:00", "09:00 - 10:00"]
  
  // Lifecycle Management
  status: { type: String, enum: ['Available', 'Reserved', 'Completed', 'Expired'], default: 'Available' },
  
  // Claiming Details (These stay empty until an NGO clicks "Reserve" and "Lock Food")
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  selectedPickupSlot: { type: String, default: null } // The specific slot the NGO chose
  
}, { timestamps: true });

module.exports = mongoose.model('FoodListing', foodListingSchema);