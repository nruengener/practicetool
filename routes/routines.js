const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const Routine = require('../models/Routine');
const Entry = require('../models/Entry');
const { ValidationError, NotFoundError } = require('../errors');
const { getOrSetCache, cache } = require('../cache');

// Validation middleware
const validateRoutine = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('entries').isArray().withMessage('Entries must be an array'),
  body('entries.*').isMongoId().withMessage('Invalid entry ID'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }
  next();
};

// Add this helper function to invalidate all routines-related cache keys
const invalidateRoutinesCache = () => {
  const keys = cache.keys(); // Assumes cache has a method to retrieve all keys
  keys.forEach(key => {
    if (key.startsWith('routines_') || key.startsWith('routine_')) {
      cache.del(key);
    }
  });
};

// Create a new routine
router.post('/', validateRoutine, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, entries } = req.body;

    // Validate that all entries exist
    const existingEntries = await Entry.find({ _id: { $in: entries } });
    if (existingEntries.length !== entries.length) {
      throw new ValidationError('One or more entries do not exist');
    }

    const routine = new Routine({ name, entries });
    await routine.save();
    invalidateRoutinesCache(); // Invalidate relevant cache keys
    res.status(201).json(routine);
  } catch (error) {
    next(error);
  }
});

// Get all routines with pagination and optional filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('name').optional().isString(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const nameFilter = req.query.name;

    const cacheKey = `routines_${page}_${limit}_${nameFilter || ''}`;

    const result = await getOrSetCache(cacheKey, async () => {
      let query = {};
      if (nameFilter) {
        query.name = new RegExp(nameFilter, 'i');
      }

      const [routines, total] = await Promise.all([
        Routine.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('entries'),
        Routine.countDocuments(query)
      ]);

      // Calculate total scheduled time and time spent for each routine
      const routinesWithTimes = await Promise.all(routines.map(async (routine) => {
        const totalScheduledTime = await routine.getTotalScheduledTime();
        const totalTimeSpent = await routine.getTotalTimeSpent();
        return {
          ...routine.toObject(),
          totalScheduledTime,
          totalTimeSpent
        };
      }));

      return {
        routines: routinesWithTimes,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRoutines: total
      };
    });

    console.log('Sending routines:', result); // Add this line for debugging
    res.json(result);
  } catch (error) {
    console.error('Error in GET /routines:', error); // Add this line for debugging
    next(error);
  }
});

// Get a single routine
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid routine ID'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const routine = await getOrSetCache(`routine_${req.params.id}`, async () => {
        const routine = await Routine.findById(req.params.id).populate('entries');
        if (!routine) {
          throw new NotFoundError('Routine not found');
        }
        const totalScheduledTime = await routine.getTotalScheduledTime();
        const totalTimeSpent = await routine.getTotalTimeSpent();
        return {
          ...routine.toObject(),
          totalScheduledTime,
          totalTimeSpent
        };
      });

      res.json(routine);
    } catch (error) {
      next(error);
    }
  }
);

// Update a routine
router.put('/:id', 
  param('id').isMongoId().withMessage('Invalid routine ID'),
  validateRoutine, 
  handleValidationErrors, 
  async (req, res, next) => {
    try {
      const { name, entries } = req.body;

      // Validate that all entries exist
      const existingEntries = await Entry.find({ _id: { $in: entries } });
      if (existingEntries.length !== entries.length) {
        throw new ValidationError('One or more entries do not exist');
      }

      const routine = await Routine.findByIdAndUpdate(
        req.params.id,
        { name, entries },
        { new: true, runValidators: true }
      ).populate('entries');

      if (!routine) {
        throw new NotFoundError('Routine not found');
      }

      const totalScheduledTime = await routine.getTotalScheduledTime();
      const totalTimeSpent = await routine.getTotalTimeSpent();

      invalidateRoutinesCache(); // Invalidate relevant cache keys
      res.json({
        ...routine.toObject(),
        totalScheduledTime,
        totalTimeSpent
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a routine
router.delete('/:id', 
  param('id').isMongoId().withMessage('Invalid routine ID'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const routine = await Routine.findByIdAndDelete(req.params.id);
      if (!routine) {
        throw new NotFoundError('Routine not found');
      }
      invalidateRoutinesCache(); // Invalidate relevant cache keys
      res.json({ message: 'Routine deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
