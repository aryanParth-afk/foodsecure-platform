const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For when you add real login later
  
  // THE MOST IMPORTANT FIELD: This dictates which dashboard they see
  role: { type: String, enum: ['Donor', 'NGO', 'Admin'], required: true },
  
  location: { type: String },
  
  // --- NGO Specific Features ---
  isVerified: { type: Boolean, default: false }, // The "Verification Badge" from your admin panel
  
  // --- Donor Specific Features ---
  rating: { type: Number, default: 0 }, // Out of 5 stars
  totalDonations: { type: Number, default: 0 } // Used for the "Donors: 100+" counter
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);