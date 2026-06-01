const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Using String prevents Mongoose from crashing if it receives mixed ID formats
  userId: { type: String, required: true },
  
  message: { type: String, required: true },
  
  type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
  
  isRead: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);