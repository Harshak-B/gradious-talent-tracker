const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    package: {
      type: Number, // in LPA
      required: [true, 'Package is required'],
      min: [0, 'Package must be positive'],
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    lastDateToApply: {
      type: Date,
    },
    eligibilityCriteria: {
      minCGPA: { type: Number, default: 0, min: 0, max: 10 },
      allowedDepartments: {
        type: [String],
        enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other', 'All'],
        default: ['All'],
      },
      graduationYear: { type: Number },
      minTenthPercent: { type: Number, default: 0 },
      minTwelfthPercent: { type: Number, default: 0 },
      backlogs: { type: Number, default: 0 },
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Internship', 'Contract', 'Part Time'],
      default: 'Full Time',
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  { timestamps: true }
);

driveSchema.index({ company: 1, status: 1, driveDate: -1 });

module.exports = mongoose.model('Drive', driveSchema);
