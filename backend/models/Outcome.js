const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema(
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
    result: {
      type: String,
      required: [true, 'Result is required'],
      enum: ['Selected', 'Rejected', 'Pending', 'Waitlisted'],
      default: 'Pending',
    },
    offeredPackage: {
      type: Number, // in LPA
      min: 0,
    },
    offerLetterDate: {
      type: Date,
    },
    joiningDate: {
      type: Date,
    },
    offeredRole: {
      type: String,
      trim: true,
    },
    offerLocation: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

// A student can have only one outcome per drive
outcomeSchema.index({ student: 1, drive: 1 }, { unique: true });
outcomeSchema.index({ result: 1, drive: 1 });

module.exports = mongoose.model('Outcome', outcomeSchema);
