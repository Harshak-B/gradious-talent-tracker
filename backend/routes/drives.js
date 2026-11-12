const express = require('express');
const { body, validationResult } = require('express-validator');
const Drive = require('../models/Drive');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', errors: errors.array() });
  }
  next();
};

const driveValidation = [
  body('company').notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('package').isFloat({ min: 0 }).withMessage('Package must be a positive number'),
  body('driveDate').isISO8601().withMessage('Valid drive date is required'),
  body('status')
    .optional()
    .isIn(['Upcoming', 'Ongoing', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
];

// GET /api/drives
router.get('/', async (req, res, next) => {
  try {
    const { status, company, jobType, page = 1, limit = 10, sort = '-driveDate' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (company) filter.company = company;
    if (jobType) filter.jobType = jobType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [drives, total] = await Promise.all([
      Drive.find(filter)
        .populate('company', 'name industry logoUrl')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Drive.countDocuments(filter),
    ]);

    res.json({
      data: drives,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/drives/:id
router.get('/:id', async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('company', 'name industry website logoUrl contactEmail contactPerson')
      .populate('registeredStudents', 'name email department graduationYear')
      .lean();
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json(drive);
  } catch (err) {
    next(err);
  }
});

// POST /api/drives
router.post('/', driveValidation, validate, async (req, res, next) => {
  try {
    const drive = await Drive.create(req.body);
    await drive.populate('company', 'name industry');
    res.status(201).json(drive);
  } catch (err) {
    next(err);
  }
});

// PUT /api/drives/:id
router.put('/:id', driveValidation, validate, async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name industry');
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json(drive);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/drives/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name industry');
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json(drive);
  } catch (err) {
    next(err);
  }
});

// POST /api/drives/:id/register - register a student
router.post('/:id/register', async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    if (drive.registeredStudents.includes(studentId)) {
      return res.status(409).json({ error: 'Student already registered for this drive' });
    }

    drive.registeredStudents.push(studentId);
    await drive.save();
    res.json({ message: 'Student registered successfully', drive });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/drives/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json({ message: 'Drive cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
