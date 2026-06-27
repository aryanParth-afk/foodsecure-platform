require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const FoodListing = require('./models/FoodListing'); 
const User = require('./models/User'); 
const Notification = require('./models/Notification'); 
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');
const auth = require('./middleware/auth'); 
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Configure Nodemailer with Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.BREVO_API_KEY?.trim() // Trim to handle spaces in .env
  }
});

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// --- REAL AUTHENTICATION ROUTES ---
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, orgName, role, adminSecretCode, phone } = req.body;

    if (role === 'Admin') {
      const masterSecret = process.env.ADMIN_SECRET_CODE || 'FoodRescueAdmin2026';
      if (adminSecretCode !== masterSecret) {
        return res.status(403).json({ message: 'Invalid Super Admin Code. Access denied.' });
      }
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'A user with this email already exists.' });

    user = new User({ email, password, orgName, role, phone });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // FIXED: Added isVerified to the payload
    const payload = { id: user._id, role: user.role, orgName: user.orgName, isVerified: user.isVerified };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon', { expiresIn: '7d' });

    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    // 1. UPDATED: We now extract the 'role' they are trying to log in as
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    if (user.role === 'Revoked') {
      return res.status(403).json({ message: 'Your account access has been revoked by a Super Admin.' });
    }

    // 2. NEW STRICT LOCK: If the portal role doesn't match the database role, reject them!
    if (role && user.role !== role) {
      // Allow SuperAdmin to log in through the Admin portal
      if (!(user.role === 'SuperAdmin' && role === 'Admin')) {
        return res.status(403).json({ 
          message: `Access Denied: You are trying to log into the ${role} portal, but your account is registered as a ${user.role}.` 
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { id: user._id, role: user.role, orgName: user.orgName, isVerified: user.isVerified };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon', { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'https://foodsecure-platform.vercel.app'}/reset-password/${resetToken}`;
    
    const emailData = {
      sender: { name: "FoodRescue Support", email: process.env.EMAIL_USER }, 
      to: [{ email: user.email }],
      subject: "FoodRescue - Password Reset Request",
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 10px;">
          <h2 style="color: #0f172a;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px;">Hello ${user.orgName},</p>
          <p style="color: #475569; font-size: 16px;">We received a request to reset your password for your FoodRescue account. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Your Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return res.status(500).json({ message: "Server error sending email. Please try again later." });
    }

    res.json({ message: "Password reset link sent to your email!" });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Your password has been successfully reset! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saving new password." });
  }
});

app.patch('/api/users/:id', auth, async (req, res) => {
  try {
    const { orgName, newPassword, currentPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required to save changes." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password. Changes denied." });
    }

    if (orgName) user.orgName = orgName;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // FIXED: Added isVerified to the payload
    const payload = { id: user._id, role: user.role, orgName: user.orgName, isVerified: user.isVerified };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon', { expiresIn: '7d' });

    res.json({ token, user: payload, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error during profile update." });
  }
});

// ==========================================
// --- NOTIFICATION ROUTES ---
// ==========================================

app.get('/api/notifications/:userId', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

app.patch('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true }, 
      { new: true }
    );
    res.json(notif);
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ message: "Server error updating notification" });
  }
});

app.patch('/api/notifications/read-all/:userId', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false }, 
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    console.error("Error marking all read:", error);
    res.status(500).json({ message: "Server error updating notifications" });
  }
});

// ==========================================
// --- DONOR ROUTES ---
// ==========================================

app.post(['/api/listings', '/api/foodlistings'], auth, async (req, res) => {
  try {
    // Accept specific expiration date/time from the frontend
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newListing = new FoodListing({
      donorId: req.body.donorId,
      foodName: req.body.foodName,
      quantity: req.body.quantity,
      pickupLocation: req.body.pickupLocation,
      lat: req.body.lat, 
      lng: req.body.lng, 
      category: req.body.category || 'General Food', 
      availableSlots: req.body.availableSlots || 'Contact for pickup time', 
      imageUrl: req.body.imageUrl || '', 
      status: 'Available',
      expiresAt: expiresAt
    });

    const savedListing = await newListing.save();
    
    // Broadcast the new listing to all connected clients
    io.emit('newListing', savedListing);

    res.status(201).json(savedListing);
  } catch (error) {
    console.error("Database Save Error:", error.message);
    res.status(500).json({ message: "Server error while creating listing", error: error.message });
  }
});

app.get('/api/my-donations/:userId', auth, async (req, res) => {
  try {
    await FoodListing.updateMany(
      { status: { $in: ['Available', 'Claimed'] }, expiresAt: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const myDonations = await FoodListing.find({ donorId: req.params.userId })
      .populate('claimedBy', 'orgName email') 
      .sort({ createdAt: -1 });
    res.json(myDonations);
  } catch (error) {
    console.error("Error fetching donor history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete('/api/listings/:id', auth, async (req, res) => {
  try {
    const deletedListing = await FoodListing.findByIdAndDelete(req.params.id);
    if (deletedListing) {
      io.emit('listingDeleted', { listingId: req.params.id });
    }
    if (!deletedListing) return res.status(404).json({ message: "Listing not found" });
    
    res.json({ message: "Donation permanently deleted." });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ message: "Server error while deleting listing" });
  }
});

app.patch('/api/listings/:id/hide-donor', auth, async (req, res) => {
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

app.get(['/api/listings/available', '/api/foodlistings/active'], auth, async (req, res) => {
  try {
    await FoodListing.updateMany(
      { status: { $in: ['Available', 'Claimed'] }, expiresAt: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const availableListings = await FoodListing.find({ status: 'Available' })
      .populate('donorId', 'orgName location isVerified') 
      .sort({ createdAt: -1 });
    res.json(availableListings);
  } catch (error) {
    console.error("Error fetching available listings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/my-claims/:userId', auth, async (req, res) => {
  try {
    await FoodListing.updateMany(
      { status: { $in: ['Available', 'Claimed'] }, expiresAt: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const myClaims = await FoodListing.find({ claimedBy: req.params.userId })
      .populate('donorId', 'orgName location')
      .sort({ updatedAt: -1 });
      
    res.json(myClaims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const processClaimRequest = async (req, res) => {
  try {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const updatedListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Claimed',
        claimedBy: req.body.ngoId || null, 
        pickupOtp: generatedOtp 
      },
      { new: true }
    ).populate('claimedBy', 'orgName phone')
     .populate('donorId', 'orgName email'); 

    if (updatedListing) {
      io.emit('listingClaimed', { listingId: updatedListing._id, ngoId: updatedListing.claimedBy?._id, status: 'Claimed' });

      await Notification.create({
        userId: updatedListing.donorId._id,
        message: `${updatedListing.claimedBy?.orgName || 'An NGO'} has claimed your donation of ${updatedListing.foodName}.`,
        type: 'info'
      });

      // Send email to donor
      if (updatedListing.donorId?.email) {
        const mailOptions = {
          from: `"FoodRescue App" <${process.env.EMAIL_USER}>`,
          to: updatedListing.donorId.email,
          subject: 'Your Food Donation was Claimed! 🎉',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #0f172a;">Great news, ${updatedListing.donorId.orgName}!</h2>
              <p style="color: #475569; font-size: 16px;"><strong>${updatedListing.claimedBy?.orgName}</strong> has just claimed your donation of <strong>${updatedListing.foodName}</strong>.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #475569;"><strong>NGO Contact Number:</strong> ${updatedListing.claimedBy?.phone || 'No phone provided'}</p>
              </div>

              <p style="color: #475569; font-size: 16px;">When they arrive to pick up the food, they must provide this 4-digit OTP code to verify the pickup:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; background: #ecfdf5; padding: 10px 30px; border-radius: 8px;">${generatedOtp}</span>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">Thank you for rescuing food today and making a difference in the community!</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.error("Error sending email:", error);
          else console.log("Email sent successfully:", info.response);
        });
      }
    }

    res.json(updatedListing);
  } catch (error) {
    console.error("Error claiming listing:", error);
    res.status(500).json({ message: "Server error while claiming listing" });
  }
};

app.patch('/api/listings/:id/claim', auth, processClaimRequest);
app.post('/api/foodlistings/claim/:id', auth, processClaimRequest);

app.patch('/api/listings/:id/verify-pickup', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    if (String(listing.pickupOtp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP code. Please try again." });
    }

    listing.status = 'Completed';
    await listing.save();

    io.emit('listingCompleted', { listingId: listing._id });

    await Notification.create({
      userId: listing.claimedBy,
      message: `Pickup verified for ${listing.foodName}! Thank you for rescuing food today.`,
      type: 'success'
    });

    res.json(listing);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

app.patch('/api/listings/:id/cancel', auth, async (req, res) => {
  try {
    const canceledListing = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Available',
        claimedBy: null,
        pickupOtp: null 
      }, 
      { new: true }
    );

    await Notification.create({
      userId: canceledListing.donorId,
      message: `An NGO had to cancel their pickup for ${canceledListing.foodName}. It has been returned to the Live Feed.`,
      type: 'warning'
    });

    res.json(canceledListing);
  } catch (error) {
    console.error("Error canceling claim:", error);
    res.status(500).json({ message: "Server error while canceling claim" });
  }
});

// ==========================================
// --- ADMIN & STATS ROUTES ---
// ==========================================

app.get('/api/admin/users', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ role: 1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching admin user list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/admin/listings', auth, async (req, res) => {
  try {
    await FoodListing.updateMany(
      { status: { $in: ['Available', 'Claimed'] }, expiresAt: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const allListings = await FoodListing.find()
      .populate('donorId', 'orgName email role')
      .populate('claimedBy', 'orgName email role')
      .sort({ createdAt: -1 }); 
      
    res.json(allListings);
  } catch (error) {
    console.error("Error fetching admin audit log:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch('/api/admin/users/:id/verify', auth, async (req, res) => {
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

app.patch('/api/admin/users/:id/promote', auth, async (req, res) => {
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

app.patch('/api/admin/users/:id/demote', auth, async (req, res) => {
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

app.delete('/api/admin/users/:id', auth, async (req, res) => {
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

app.get('/api/admin/analytics', auth, async (req, res) => {
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
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔔 NOTIFICATIONS ACTIVATED: Pipeline is live!`);
});