const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const Entry = require('../models/Entry');
const { ValidationError, NotFoundError } = require('../errors');
const { getOrSetCache, cache } = require('../cache');

// Validation middleware
const validateEntry = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().optional(),
  body('scheduledTime').isInt({ min: 1 }).withMessage('Scheduled time must be a positive integer'),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }
  next();
};

// Add this helper function to invalidate all entries-related cache keys
const invalidateEntriesCache = () => {
  const keys = cache.keys(); // Assumes cache has a method to retrieve all keys
  keys.forEach(key => {
    if (key.startsWith('entries_') || key.startsWith('entry_')) {
      cache.del(key);
    }
  });
};

// Create a new entry
router.post('/', validateEntry, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, description, scheduledTime } = req.body;
    const entry = new Entry({ name, description, scheduledTime });
    await entry.save();
    invalidateEntriesCache(); // Invalidate relevant cache keys
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// Get all entries with pagination, optional filtering, and sorting
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('name').optional().isString(),
  query('sortBy').optional().isIn(['name', 'createdAt']).withMessage('Invalid sort field'),
], async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const nameFilter = req.query.name;
    const sortBy = req.query.sortBy || 'createdAt';

    const cacheKey = `entries_${page}_${limit}_${nameFilter || ''}_${sortBy}`;

    const result = await getOrSetCache(cacheKey, async () => {
      let query = {};
      if (nameFilter) {
        query.name = new RegExp(nameFilter, 'i');
      }

      const sortOption = {};
      sortOption[sortBy] = sortBy === 'name' ? 1 : -1; // 1 for ascending, -1 for descending

      const [entries, total] = await Promise.all([
        Entry.find(query).sort(sortOption).skip(skip).limit(limit),
        Entry.countDocuments(query)
      ]);

      return {
        entries,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get a single entry
router.get('/:id', 
  param('id').isMongoId().withMessage('Invalid entry ID'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const entry = await getOrSetCache(`entry_${req.params.id}`, async () => {
        const entry = await Entry.findById(req.params.id);
        if (!entry) {
          throw new NotFoundError('Entry not found');
        }
        return entry;
      });

      res.json(entry);
    } catch (error) {
      next(error);
    }
  }
);

// Update an entry
router.put('/:id', 
  param('id').isMongoId().withMessage('Invalid entry ID'),
  validateEntry, 
  handleValidationErrors, 
  async (req, res, next) => {
    try {
      const { name, description, scheduledTime } = req.body;
      const entry = await Entry.findByIdAndUpdate(
        req.params.id,
        { name, description, scheduledTime },
        { new: true, runValidators: true }
      );
      if (!entry) {
        throw new NotFoundError('Entry not found');
      }
      invalidateEntriesCache(); // Invalidate relevant cache keys
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }
);

// Delete an entry
router.delete('/:id', 
  param('id').isMongoId().withMessage('Invalid entry ID'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const entry = await Entry.findByIdAndDelete(req.params.id);
      if (!entry) {
        throw new NotFoundError('Entry not found');
      }
      invalidateEntriesCache(); // Invalidate relevant cache keys
      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
