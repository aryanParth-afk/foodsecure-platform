// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const FoodListing = require('./models/FoodListing');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data (optional, but good for starting fresh)
    await User.deleteMany({});
    await FoodListing.deleteMany({});

    // 1. Create a dummy Restaurant User
    const dummyUser = await User.create({
      name: "Downtown Cafe",
      email: "cafe@test.com",
      password: "password123", // In a real app, this would be hashed
      role: "donor",
      organization: "Downtown Cafe Corp"
    });
    console.log('👤 Dummy User Created');

    // 2. Create some dummy Food Listings linked to that user
    const dummyListings = await FoodListing.insertMany([
      {
        donorId: dummyUser._id,
        foodName: "Margherita Pizzas (3 Whole)",
        quantity: "3 items",
        category: "Veg",
        expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // Expires in 3 hours
        pickupLocation: "123 Main St, Bakery Back Door",
        status: "Active"
      },
      {
        donorId: dummyUser._id,
        foodName: "Chicken Salad Sandwiches",
        quantity: "15 items",
        category: "Non-Veg",
        expiryTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in 1 hour
        pickupLocation: "123 Main St, Cafe Counter",
        status: "Active"
      },
      {
        donorId: dummyUser._id,
        foodName: "Assorted Bagels and Pastries",
        quantity: "1 Large Box",
        category: "Veg",
        expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // Expires in 5 hours
        pickupLocation: "456 Market St",
        status: "Active"
      }
    ]);
    
    console.log(`🍔 Successfully added ${dummyListings.length} food listings!`);
    console.log('🏁 Seeding complete. Exiting...');
    process.exit();
    
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();