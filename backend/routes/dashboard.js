const express = require('express');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Interview = require('../models/Interview');
const Outcome = require('../models/Outcome');

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', async (req, res, next) => {
  try {
    const [
      totalStudents,
      placedStudents,
      inProgressStudents,
      totalCompanies,
      totalDrives,
      upcomingDrives,
      totalInterviews,
      selectedOutcomes,
      rejectedOutcomes,
      pendingOutcomes,
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true, placementStatus: 'Placed' }),
      Student.countDocuments({ isActive: true, placementStatus: 'In Progress' }),
      Company.countDocuments({ isActive: true }),
      Drive.countDocuments(),
      Drive.countDocuments({ status: 'Upcoming' }),
      Interview.countDocuments(),
      Outcome.countDocuments({ result: 'Selected' }),
      Outcome.countDocuments({ result: 'Rejected' }),
      Outcome.countDocuments({ result: 'Pending' }),
    ]);

    // Placement by department
    const placementByDept = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent drives
    const recentDrives = await Drive.find()
      .populate('company', 'name')
      .sort('-driveDate')
      .limit(5)
      .lean();

    // Top packages
    const topPackages = await Outcome.find({ result: 'Selected', offeredPackage: { $gt: 0 } })
      .populate('student', 'name department')
      .populate({ path: 'drive', populate: { path: 'company', select: 'name' } })
      .sort('-offeredPackage')
      .limit(5)
      .lean();

    res.json({
      counts: {
        totalStudents,
        placedStudents,
        inProgressStudents,
        notPlacedStudents: totalStudents - placedStudents - inProgressStudents,
        totalCompanies,
        totalDrives,
        upcomingDrives,
        totalInterviews,
        selectedOutcomes,
        rejectedOutcomes,
        pendingOutcomes,
      },
      placementByDept,
      recentDrives,
      topPackages,
      placementRate:
        totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0.0',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
