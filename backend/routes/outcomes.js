const express = require('express');
const { body, validationResult } = require('express-validator');
const Outcome = require('../models/Outcome');
const Student = require('../models/Student');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', errors: errors.array() });
  }
  next();
};

const outcomeValidation = [
  body('student').notEmpty().withMessage('Student is required'),
  body('drive').notEmpty().withMessage('Drive is required'),
  body('result')
    .isIn(['Selected', 'Rejected', 'Pending', 'Waitlisted'])
    .withMessage('Invalid result'),
  body('offeredPackage').optional().isFloat({ min: 0 }).withMessage('Package must be positive'),
];

// GET /api/outcomes
router.get('/', async (req, res, next) => {
  try {
    const { result, drive, student, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filter = {};
    if (result) filter.result = result;
    if (drive) filter.drive = drive;
    if (student) filter.student = student;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [outcomes, total] = await Promise.all([
      Outcome.find(filter)
        .populate('student', 'name email department graduationYear')
        .populate({ path: 'drive', populate: { path: 'company', select: 'name' } })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Outcome.countDocuments(filter),
    ]);

    res.json({
      data: outcomes,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/outcomes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const outcome = await Outcome.findById(req.params.id)
      .populate('student', 'name email department graduationYear cgpa')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name industry' } })
      .lean();
    if (!outcome) return res.status(404).json({ error: 'Outcome not found' });
    res.json(outcome);
  } catch (err) {
    next(err);
  }
});

// POST /api/outcomes
router.post('/', outcomeValidation, validate, async (req, res, next) => {
  try {
    const outcome = await Outcome.create(req.body);

    // Update student placement status automatically
    if (req.body.result === 'Selected') {
      await Student.findByIdAndUpdate(req.body.student, { placementStatus: 'Placed' });
    } else if (req.body.result === 'Pending' || req.body.result === 'Waitlisted') {
      await Student.findByIdAndUpdate(req.body.student, { placementStatus: 'In Progress' });
    }

    await outcome.populate('student', 'name email');
    await outcome.populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    res.status(201).json(outcome);
  } catch (err) {
    next(err);
  }
});

// PUT /api/outcomes/:id
router.put('/:id', outcomeValidation, validate, async (req, res, next) => {
  try {
    const outcome = await Outcome.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    if (!outcome) return res.status(404).json({ error: 'Outcome not found' });

    // Sync placement status
    if (req.body.result === 'Selected') {
      await Student.findByIdAndUpdate(req.body.student, { placementStatus: 'Placed' });
    }

    res.json(outcome);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/outcomes/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const outcome = await Outcome.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    if (!outcome) return res.status(404).json({ error: 'Outcome not found' });
    res.json(outcome);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/outcomes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const outcome = await Outcome.findByIdAndDelete(req.params.id);
    if (!outcome) return res.status(404).json({ error: 'Outcome not found' });
    res.json({ message: 'Outcome deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
