const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const SelectedRoutine = require('../models/SelectedRoutine');
const Routine = require('../models/Routine');
const Entry = require('../models/Entry');
const { ValidationError, NotFoundError } = require('../errors');
const { getOrSetCache, cache } = require('../cache');
const EntryRecord = require('../models/EntryRecord');

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }
  next();
};

// Set the selected routine
router.post('/:id/select', 
  param('id').isMongoId().withMessage('Invalid routine ID'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const routineId = req.params.id;

      // Check if the routine exists
      const routineExists = await Routine.findById(routineId);
      if (!routineExists) {
        throw new NotFoundError('Routine not found');
      }

      // Log the selection action
      console.log(`Selecting routine ${routineId}`);

      // Create new selected routine (this will automatically delete any existing one)
      const selectedRoutine = new SelectedRoutine({ routine: routineId });
      await selectedRoutine.save();

      cache.del('selectedRoutine'); // Invalidate the selected routine cache

      res.json({ message: 'Routine selected successfully' });
    } catch (error) {
      console.error(`Error selecting routine ${req.params.id}:`, error); // Enhanced error logging
      next(error);
    }
  }
);

// Deselect the current routine
router.post('/deselect', async (req, res, next) => {
  try {
    console.log('Deselecting current routine');
    await SelectedRoutine.deleteMany({});
    cache.del('selectedRoutine'); // Invalidate the selected routine cache
    res.json({ message: 'Routine deselected successfully' });
  } catch (error) {
    console.error('Error deselecting routine:', error); // Enhanced error logging
    next(error);
  }
});

// Get the selected routine
router.get('/', async (req, res, next) => {
  console.log('GET /api/selected-routine called');
  try {
    const selectedRoutine = await getOrSetCache('selectedRoutine', async () => {
      const selectedRoutine = await SelectedRoutine.getCurrentRoutine();

      if (!selectedRoutine) {
        return null;
      }

      const totalScheduledTime = await selectedRoutine.getTotalScheduledTime();
      const totalTimeSpent = await selectedRoutine.getTotalTimeSpent();

      return {
        ...selectedRoutine.toObject(),
        totalScheduledTime,
        totalTimeSpent
      };
    });

    if (!selectedRoutine) {
      console.log('No routine is currently selected');
      return res.status(404).json({ message: 'No routine is currently selected' });
    }

    console.log('Sending selected routine:', JSON.stringify(selectedRoutine, null, 2));
    res.json(selectedRoutine);
  } catch (error) {
    console.error('Error in GET /api/selected-routine:', error);
    next(error);
  }
});

// Add time to an entry in the selected routine
router.post('/entry/:entryId/add-time', 
  param('entryId').isMongoId().withMessage('Invalid entry ID'),
  body('time').isInt({ min: 0 }).withMessage('Time must be a non-negative integer'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { entryId } = req.params;
      const { time } = req.body;

      console.log(`Received request to add ${time} minutes to entry ${entryId}`);

      if (time === 0) {
        console.log(`No time added for entry ${entryId} as time provided is 0`);
        return res.json({ message: 'No time added' });
      }

      const selectedRoutine = await SelectedRoutine.getCurrentRoutine();
      if (!selectedRoutine) {
        throw new NotFoundError('No routine is currently selected');
      }

      const entry = selectedRoutine.routine.entries.find(e => e._id.toString() === entryId);
      if (!entry) {
        throw new NotFoundError('Entry not found in the selected routine');
      }

      // Update the entry's time spent
      entry.timeSpent = (entry.timeSpent || 0) + time;
      await entry.save();
      console.log(`Updated timeSpent for entry ${entryId}: ${entry.timeSpent} minutes`);

      // Create a new EntryRecord
      const entryRecord = new EntryRecord({
        entry: entryId,
        date: new Date(),
        totalTime: time
      });
      await entryRecord.save();
      console.log(`Created EntryRecord ${entryRecord._id} for entry ${entryId} with ${time} minutes`);

      // Recalculate total time spent
      const totalTimeSpent = await selectedRoutine.getTotalTimeSpent();
      console.log(`Total time spent on routine ${selectedRoutine.routine._id}: ${totalTimeSpent} minutes`);

      cache.del('selectedRoutine'); // Invalidate the selected routine cache
      cache.del(`routine_${selectedRoutine.routine._id}`); // Invalidate the routine cache
      cache.del(`entry_${entryId}`); // Invalidate the entry cache

      res.json({ 
        message: 'Time added successfully', 
        updatedEntry: entry,
        totalTimeSpent,
        entryRecord
      });
    } catch (error) {
      console.error(`Error adding time to entry ${req.params.entryId}:`, error);
      next(error);
    }
  }
);

module.exports = router;