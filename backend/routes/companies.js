const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', errors: errors.array() });
  }
  next();
};

const companyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Valid contact email is required')
    .normalizeEmail(),
];

// GET /api/companies
router.get('/', async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 10, sort = 'name' } = req.query;

    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }
    if (industry) filter.industry = industry;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [companies, total] = await Promise.all([
      Company.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Company.countDocuments(filter),
    ]);

    res.json({
      data: companies,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// POST /api/companies
router.post('/', companyValidation, validate, async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id
router.put('/:id', companyValidation, validate, async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/companies/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/companies/:id (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deactivated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
