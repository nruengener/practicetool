const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  entries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Entry' 
  }],
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

// Add a compound index for name and createdAt
RoutineSchema.index({ name: 1, createdAt: 1 });

// Update the updatedAt field before saving
RoutineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add a static method to find routines by name (case-insensitive)
RoutineSchema.statics.findByName = function(name) {
  return this.find({ name: new RegExp(name, 'i') });
};

// Add a method to get the total scheduled time for a routine
RoutineSchema.methods.getTotalScheduledTime = async function() {
  const entries = await mongoose.model('Entry').find({ _id: { $in: this.entries } });
  return entries.reduce((total, entry) => total + entry.scheduledTime, 0);
};

// Add a method to get the total time spent on a routine
RoutineSchema.methods.getTotalTimeSpent = async function() {
  const entries = await mongoose.model('Entry').find({ _id: { $in: this.entries } });
  return entries.reduce((total, entry) => total + (entry.timeSpent || 0), 0);
};

module.exports = mongoose.model('Routine', RoutineSchema);
