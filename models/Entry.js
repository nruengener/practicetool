const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  description: String,
  scheduledTime: { 
    type: Number, 
    required: true 
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for faster sorting and filtering
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add a compound index for name and scheduledTime
EntrySchema.index({ name: 1, scheduledTime: 1 });

// Update the updatedAt field before saving
EntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add a static method to find entries by name (case-insensitive)
EntrySchema.statics.findByName = function(name) {
  return this.find({ name: new RegExp(name, 'i') });
};

module.exports = mongoose.model('Entry', EntrySchema);
