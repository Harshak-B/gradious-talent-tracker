const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'],
        message: '{VALUE} is not a valid department',
      },
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2020, 'Graduation year must be 2020 or later'],
      max: [2035, 'Graduation year must be 2035 or earlier'],
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA must be at least 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    skills: {
      type: [String],
      default: [],
    },
    placementStatus: {
      type: String,
      enum: ['Not Placed', 'In Progress', 'Placed', 'Opted Out'],
      default: 'Not Placed',
    },
    tenthPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    twelfthPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
studentSchema.index({ name: 'text', email: 'text', skills: 'text' });
studentSchema.index({ department: 1, graduationYear: 1, placementStatus: 1 });

module.exports = mongoose.model('Student', studentSchema);
