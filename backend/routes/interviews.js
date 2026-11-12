const express = require('express');
const { body, validationResult } = require('express-validator');
const Interview = require('../models/Interview');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', errors: errors.array() });
  }
  next();
};

const interviewValidation = [
  body('student').notEmpty().withMessage('Student is required'),
  body('drive').notEmpty().withMessage('Drive is required'),
  body('roundNumber').isInt({ min: 1 }).withMessage('Round number must be a positive integer'),
  body('roundType')
    .isIn(['Aptitude', 'Technical', 'Coding', 'Group Discussion', 'HR', 'Managerial', 'Cultural Fit', 'Other'])
    .withMessage('Invalid round type'),
  body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'Completed', 'Cancelled', 'No Show'])
    .withMessage('Invalid status'),
  body('result')
    .optional()
    .isIn(['Passed', 'Failed', 'On Hold', 'Pending'])
    .withMessage('Invalid result'),
];

// GET /api/interviews
router.get('/', async (req, res, next) => {
  try {
    const { student, drive, status, result, roundType, page = 1, limit = 10, sort = '-scheduledAt' } = req.query;

    const filter = {};
    if (student) filter.student = student;
    if (drive) filter.drive = drive;
    if (status) filter.status = status;
    if (result) filter.result = result;
    if (roundType) filter.roundType = roundType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('student', 'name email department')
        .populate({ path: 'drive', populate: { path: 'company', select: 'name' } })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Interview.countDocuments(filter),
    ]);

    res.json({
      data: interviews,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews/:id
router.get('/:id', async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('student', 'name email department cgpa')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name industry' } })
      .lean();
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    next(err);
  }
});

// POST /api/interviews
router.post('/', interviewValidation, validate, async (req, res, next) => {
  try {
    const interview = await Interview.create(req.body);
    await interview.populate('student', 'name email');
    await interview.populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    res.status(201).json(interview);
  } catch (err) {
    next(err);
  }
});

// PUT /api/interviews/:id
router.put('/:id', interviewValidation, validate, async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/interviews/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name' } });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json(interview);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ message: 'Interview deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
