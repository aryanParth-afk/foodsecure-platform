const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  orgName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String, default: '' },
  password: { type: String, required: true }, // For when you add real login later
  phone: { type: String, required: false }, 
  
  // THE MOST IMPORTANT FIELD: This dictates which dashboard they see
  role: {
    type: String,
    // ADD 'Revoked' TO THE LIST!
    enum: ['NGO', 'Donor', 'Admin', 'SuperAdmin', 'Revoked'], 
    required: true
  },
  // NEW: Memory bank to remember what they were before promotion!
  originalRole: {
    type: String,
    enum: ['NGO', 'Donor']
  },

  // NEW: Forgot Password Fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  location: { type: String },
  
  // --- NGO Specific Features ---
  isVerified: { type: Boolean, default: false }, // The "Verification Badge" from your admin panel
  
  // --- Donor Specific Features ---
  rating: { type: Number, default: 0 }, // Out of 5 stars
  totalDonations: { type: Number, default: 0 } // Used for the "Donors: 100+" counter
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);