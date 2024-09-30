const mongoose = require('mongoose');

const SelectedRoutineSchema = new mongoose.Schema({
  routine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Routine',
    required: true,
    index: true // Add index for faster queries
  },
  selectedAt: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for faster sorting and filtering
  }
});

// Ensure only one selected routine exists
SelectedRoutineSchema.pre('save', async function(next) {
  if (this.isNew) {
    await this.constructor.deleteMany({});
  }
  next();
});

// Update the getCurrentRoutine static method
SelectedRoutineSchema.statics.getCurrentRoutine = function() {
  return this.findOne().populate({
    path: 'routine',
    populate: { 
      path: 'entries',
      model: 'Entry'
    }
  });
};

// Add a method to get the total scheduled time for the selected routine
SelectedRoutineSchema.methods.getTotalScheduledTime = async function() {
  await this.populate({
    path: 'routine',
    populate: { 
      path: 'entries',
      model: 'Entry'
    }
  }).execPopulate();

  return this.routine.entries.reduce((total, entry) => total + entry.scheduledTime, 0);
};

// Add a method to get the total time spent on the selected routine
SelectedRoutineSchema.methods.getTotalTimeSpent = async function() {
  await this.populate({
    path: 'routine',
    populate: { 
      path: 'entries',
      model: 'Entry'
    }
  }).execPopulate();

  return this.routine.entries.reduce((total, entry) => total + (entry.timeSpent || 0), 0);
};

module.exports = mongoose.model('SelectedRoutine', SelectedRoutineSchema);
