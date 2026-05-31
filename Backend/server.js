require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const FoodListing = require('./models/FoodListing'); 
const User = require('./models/User'); 

const app = express();
app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// --- REAL AUTHENTICATION ROUTES ---
// ==========================================

// 1. USER SIGNUP
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, orgName, role, adminSecretCode } = req.body;

    if (role === 'Admin') {
      const masterSecret = process.env.ADMIN_SECRET_CODE || 'FoodRescueAdmin2026';
      if (adminSecretCode !== masterSecret) {
        return res.status(403).json({ message: 'Invalid Super Admin Code. Access denied.' });
      }
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'A user with this email already exists.' });

    user = new User({ email, password, orgName, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { id: user._id, role: user.role, orgName: user.orgName };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon', { expiresIn: '7d' });

    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. USER LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    if (user.role === 'Revoked') {
      return res.status(403).json({ message: 'Your account access has been revoked by a Super Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { id: user._id, role: user.role, orgName: user.orgName };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon', { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ==========================================
// --- DONOR ROUTES ---
// ==========================================

app.post('/api/listings', async (req, res) => {
  try {
    const newListing = new FoodListing({
      donorId: req.body.donorId,
      foodName: req.body.foodName,
      quantity: req.body.quantity,
      pickupLocation: req.body.pickupLocation,
      category: req.body.category || 'General Food', 
      availableSlots: req.body.availableSlots || 'Contact for pickup time', 
      imageUrl: req.body.imageUrl || '', 
      status: 'Available'
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error("Database Save Error:", error.message);
    res.status(500).json({ message: "Server error while creating listing", error: error.message });
  }
});

app.get('/api/my-donations/:userId', async (req, res) => {
  try {
    const myDonations = await FoodListing.find({ donorId: req.params.userId })
      .populate('claimedBy', 'orgName email') 
      .sort({ createdAt: -1 });
    res.json(myDonations);
  } catch (error) {
    console.error("Error fetching donor history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// NEW ROUTE: Soft-delete (hide) a history item for the Donor
app.patch('/api/listings/:id/hide-donor', async (req, res) => {
  try {
    const hiddenListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { donorHidden: true },
      { new: true }
    );
    res.json(hiddenListing);
  } catch (error) {
    console.error("Error hiding listing:", error);
    res.status(500).json({ message: "Server error while hiding listing" });
  }
});

// ==========================================
// --- NGO ROUTES ---
// ==========================================

app.get('/api/listings/available', async (req, res) => {
  try {
    const availableListings = await FoodListing.find({ status: 'Available' })
      .populate('donorId', 'orgName location isVerified') 
      .sort({ createdAt: -1 });
    res.json(availableListings);
  } catch (error) {
    console.error("Error fetching available listings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/my-claims/:userId', async (req, res) => {
  try {
    const myClaims = await FoodListing.find({ claimedBy: req.params.userId })
      .populate('donorId', 'orgName location')
      .sort({ updatedAt: -1 });
      
    res.json(myClaims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Claim a specific food donation (UPGRADED WITH OTP)
app.patch('/api/listings/:id/claim', async (req, res) => {
  try {
    // Generate a random 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const updatedListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Claimed',
        claimedBy: req.body.ngoId,
        pickupOtp: generatedOtp // Save the secret code to the database
      },
      { new: true }
    );
    res.json(updatedListing);
  } catch (error) {
    console.error("Error claiming listing:", error);
    res.status(500).json({ message: "Server error while claiming listing" });
  }
});

// NEW ROUTE: Verify Pickup using OTP
app.patch('/api/listings/:id/verify-pickup', async (req, res) => {
  try {
    const { otp } = req.body;
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    // Convert both to strings just to be 100% safe on the comparison
    if (String(listing.pickupOtp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP code. Please try again." });
    }

    // THE FIX: Must be 'Completed' with a capital C to match your Mongoose Schema!
    listing.status = 'Completed';
    await listing.save();

    res.json(listing);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

app.patch('/api/listings/:id/cancel', async (req, res) => {
  try {
    const canceledListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Available',
        claimedBy: null,
        pickupOtp: null // Clean up the OTP if cancelled
      }, 
      { new: true }
    );
    res.json(canceledListing);
  } catch (error) {
    console.error("Error canceling claim:", error);
    res.status(500).json({ message: "Server error while canceling claim" });
  }
});

// ==========================================
// --- ADMIN & STATS ROUTES ---
// ==========================================

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ role: 1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching admin user list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch('/api/admin/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = !user.isVerified;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch('/api/admin/users/:id/promote', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === 'NGO' || user.role === 'Donor') {
      user.originalRole = user.role; 
    }
    
    user.role = 'Admin';
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ message: "Server error during promotion" });
  }
});

app.patch('/api/admin/users/:id/demote', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.originalRole) {
      user.role = user.originalRole;
    } else {
      user.role = 'Revoked';
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error demoting admin:", error);
    res.status(500).json({ message: "Server error during demotion" });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ message: "User permanently deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error during deletion" });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const donorCount = await User.countDocuments({ role: 'Donor' });
    const ngoCount = await User.countDocuments({ role: 'NGO' });
    const mealsCount = await FoodListing.countDocuments();

    res.json({
      savedMeals: mealsCount + 1000,
      donors: donorCount + 100,
      ngos: ngoCount + 50
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'Donor' });
    const totalNGOs = await User.countDocuments({ role: 'NGO' });

    res.json({
      metrics: {
        totalDonors: totalDonors,
        totalNGOs: totalNGOs,
        totalMeals: 8500, 
        growth: 61
      },
      monthlyData: [
        { name: 'Jan', meals: 400, donors: 24, ngos: 10 },
        { name: 'Feb', meals: 600, donors: 35, ngos: 15 },
        { name: 'Mar', meals: 800, donors: 45, ngos: 22 },
        { name: 'Apr', meals: 1200, donors: 60, ngos: 35 },
        { name: 'May', meals: 2100, donors: 85, ngos: 48 },
        { name: 'Jun', meals: 3400, donors: 110, ngos: 65 },
      ],
      foodTypeData: [
        { name: 'Produce', amount: 1200 },
        { name: 'Baked Goods', amount: 850 },
        { name: 'Prepared Meals', amount: 2100 },
        { name: 'Dairy', amount: 600 },
      ]
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🟢 FINGERPRINT TEST: Code successfully deployed with strict filtering!`);
});