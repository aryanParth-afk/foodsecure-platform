const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const FoodListing = require('./models/FoodListing');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodrescue')
  .then(async () => {
    console.log("🔥 Connected to DB. Wiping old data...");
    
    // 1. Delete all old incompatible data
    await User.deleteMany({});
    await FoodListing.deleteMany({});

    console.log("✅ Old data wiped. Creating fresh profiles...");

    // 2. Create a fresh Donor Profile
    const newDonor = await User.create({
      orgName: "Downtown Bakery",
      username: "DowntownB!1",
      email: "baker@test.com",
      password: "password123", // Dummy password
      role: "Donor",
      location: "123 Main St",
      rating: 4.8,
      totalDonations: 15
    });

    // 3. Create a fresh NGO Profile
    const newNGO = await User.create({
      orgName: "City Hope Shelter",
      username: "CityHope!2",
      email: "hope@test.com",
      password: "password123",
      role: "NGO",
      location: "456 Charity Ave",
      isVerified: true
    });

    console.log("✅ Profiles created. Creating fresh food listing...");

    // 4. Create a fresh Food Listing tied to the Donor
    await FoodListing.create({
      donorId: newDonor._id,
      foodName: "Assorted Bagels and Bread",
      quantity: "2 Large Boxes",
      category: "Veg",
      pickupLocation: "Downtown Bakery Backdoor",
      availableSlots: ["8-9 AM", "9-10 AM"], // New required field!
      status: "Available"
    });

    console.log("🎉 Database Successfully Reset! You can close this script.");
    process.exit();
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });