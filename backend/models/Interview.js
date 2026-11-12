const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: [true, 'Drive is required'],
    },
    roundNumber: {
      type: Number,
      required: [true, 'Round number is required'],
      min: [1, 'Round number must be at least 1'],
    },
    roundType: {
      type: String,
      required: [true, 'Round type is required'],
      enum: ['Aptitude', 'Technical', 'Coding', 'Group Discussion', 'HR', 'Managerial', 'Cultural Fit', 'Other'],
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    conductedAt: {
      type: Date,
    },
    interviewerName: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    result: {
      type: String,
      enum: ['Passed', 'Failed', 'On Hold', 'Pending'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ student: 1, drive: 1, roundNumber: 1 });
interviewSchema.index({ drive: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
