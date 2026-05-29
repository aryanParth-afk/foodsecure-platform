require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // ADDED FOR SECURITY
const jwt = require('jsonwebtoken'); // ADDED FOR SECURITY
const FoodListing = require('./models/FoodListing'); 
const User = require('./models/User'); // Moved to top for global access

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
    const { email, password, orgName, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'A user with this email already exists.' });

    // Create new instance
    user = new User({ email, password, orgName, role });

    // Hash the password using bcrypt salt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save to MongoDB Atlas
    await user.save();

    // Create JWT Payload
    const payload = { id: user._id, role: user.role, orgName: user.orgName };

    // Sign Token
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    // Compare hashed password with input
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    // Create JWT Payload
    const payload = { id: user._id, role: user.role, orgName: user.orgName };

    // Sign Token
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

app.get('/api/listings', async (req, res) => {
  try {
    const listings = await FoodListing.find({ status: 'Available' });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to claim a specific food donation
app.patch('/api/listings/:id/claim', async (req, res) => {
  try {
    const updatedListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Claimed',
        claimedBy: req.body.ngoId // NEW: Tell the database WHO claimed it!
      },
      { new: true }
    );
    res.json(updatedListing);
  } catch (error) {
    console.error("Error claiming listing:", error);
    res.status(500).json({ message: "Server error while claiming listing" });
  }
});

// Route to CREATE a new food listing
app.post('/api/listings', async (req, res) => {
  try {
    const newListing = new FoodListing({
      donorId: req.body.donorId,
      foodName: req.body.foodName,
      quantity: req.body.quantity,
      pickupLocation: req.body.pickupLocation,
      // Adding safe default fallbacks so MongoDB doesn't crash if these are missing!
      category: req.body.category || 'General Food', 
      availableSlots: req.body.availableSlots || 'Contact for pickup time', 
      imageUrl: req.body.imageUrl || '', 
      status: 'Available'
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    // Sending the actual error message to the console so we can see EXACTLY what went wrong
    console.error("Database Save Error:", error.message);
    res.status(500).json({ message: "Server error while creating listing", error: error.message });
  }
});

// Route to GET all listings specifically for the logged-in Donor
app.get('/api/my-donations/:userId', async (req, res) => {
  try {
    // Finds only the donations matching this specific user
    const myDonations = await FoodListing.find({ donorId: req.params.userId }).sort({ createdAt: -1 });
    res.json(myDonations);
  } catch (error) {
    console.error("Error fetching donor history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get all CLAIMED food listings
app.get('/api/listings/claimed', async (req, res) => {
  try {
    const claimedListings = await FoodListing.find({ status: 'Claimed' }).sort({ updatedAt: -1 });
    res.json(claimedListings);
  } catch (error) {
    console.error("Error fetching claimed listings:", error);
    res.status(500).json({ message: "Server error while fetching claims" });
  }
});

// ==========================================
// --- NGO ROUTES ---
// ==========================================

// 1. Get all AVAILABLE listings (for the main feed)
app.get('/api/listings/available', async (req, res) => {
  try {
    const availableListings = await FoodListing.find({ status: 'Available' })
      .populate('donorId', 'orgName location isVerified') 
      .sort({ createdAt: -1 });
    res.json(availableListings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Get listings CLAIMED by the logged-in NGO
app.get('/api/my-claims/:userId', async (req, res) => {
  try {
    // Find claims where the 'claimedBy' matches the ID sent from the frontend
    const myClaims = await FoodListing.find({ claimedBy: req.params.userId })
      .populate('donorId', 'orgName location')
      .sort({ updatedAt: -1 });
      
    res.json(myClaims);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. RESERVE a listing (Lock Food with a specific slot)
app.patch('/api/listings/:id/reserve', async (req, res) => {
  try {
    const defaultUser = await User.findOne(); 
    const { selectedSlot } = req.body;

    if (!selectedSlot) return res.status(400).json({ message: "A time slot is required" });

    const reservedListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Reserved', 
        claimedBy: defaultUser._id,
        selectedPickupSlot: selectedSlot
      },
      { new: true }
    );
    res.json(reservedListing);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// --- ADMIN ROUTES ---
// ==========================================

// 1. Get ALL users (including other Admins so you can manage them)
app.get('/api/admin/users', async (req, res) => {
  try {
    const User = require('./models/User');
    // Fetch EVERYONE, sorted by role so Admins appear at the top
    const users = await User.find().sort({ role: 1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching admin user list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Toggle Verification Badge status for a user
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

// 3. Promote a user to Admin role
app.patch('/api/admin/users/:id/promote', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Change the role to Admin permanently
    user.role = 'Admin';
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Server error during promotion" });
  }
});

// 4. Demote an Admin back to a regular user
app.patch('/api/admin/users/:id/demote', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Change their role back to a standard Donor
    user.role = 'Donor';
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error demoting admin:", error);
    res.status(500).json({ message: "Server error during demotion" });
  }
});

// Route to CANCEL a claim (returns item to the Live Feed)
app.patch('/api/listings/:id/cancel', async (req, res) => {
  try {
    const canceledListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { status: 'Available' }, // Fixed bug: Used to be 'Active', now matches 'Available'
      { new: true }
    );
    res.json(canceledListing);
  } catch (error) {
    console.error("Error canceling claim:", error);
    res.status(500).json({ message: "Server error while canceling claim" });
  }
});

// ==========================================
// --- STATS ROUTE ---
// ==========================================

const PORT = process.env.PORT || 5001; // Made port dynamic for Render!

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

// --- ANALYTICS ENDPOINT ---
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // 1. Fetch REAL user counts from your MongoDB database
    const totalDonors = await User.countDocuments({ role: 'Donor' });
    const totalNGOs = await User.countDocuments({ role: 'NGO' });

    // 2. Package it together with chart data 
    // (Note: Meals and charts are kept static until you build a Donations database model!)
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🟢 FINGERPRINT TEST: If you see this, the file is successfully updated!`);
});