const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FoodListing = require('./models/FoodListing');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodrescue')
  .then(async () => {
    // Delete any listing that looks like a dummy listing
    const res = await FoodListing.deleteMany({ foodName: /Bagel|Dummy|Test/i });
    console.log(`Deleted ${res.deletedCount} dummy listings.`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
