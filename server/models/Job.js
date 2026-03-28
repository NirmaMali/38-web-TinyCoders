const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requiredSkills: [{ type: String, trim: true }],
    minCGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    package: {
      type: Number,
      required: [true, 'Package is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['on-campus', 'off-campus', 'internship'],
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['applied', 'shortlisted', 'rejected', 'placed'],
          default: 'applied',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ type: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ deadline: 1 });

module.exports = mongoose.model('Job', jobSchema);
