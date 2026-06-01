const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who is receiving this notification?
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The actual alert message
  message: { type: String, required: true },
  
  // Color coding the alert (info = blue, success = green, warning = orange)
  type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
  
  // Has the user seen it yet?
  isRead: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);