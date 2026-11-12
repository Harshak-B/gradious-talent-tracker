const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Student = require('../models/Student');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', errors: errors.array() });
  }
  next();
};

const studentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('department')
    .isIn(['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'])
    .withMessage('Invalid department'),
  body('graduationYear')
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Graduation year must be between 2020 and 2035'),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('placementStatus')
    .optional()
    .isIn(['Not Placed', 'In Progress', 'Placed', 'Opted Out'])
    .withMessage('Invalid placement status'),
];

// GET /api/students
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      department,
      graduationYear,
      placementStatus,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (department) filter.department = department;
    if (graduationYear) filter.graduationYear = Number(graduationYear);
    if (placementStatus) filter.placementStatus = placementStatus;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Student.countDocuments(filter),
    ]);

    res.json({
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// POST /api/students
router.post('/', studentValidation, validate, async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id
router.put('/:id', studentValidation, validate, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/students/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deactivated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
