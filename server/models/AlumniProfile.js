const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      enum: ['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'],
    },
    batchYear: {
      type: Number,
      required: [true, 'Batch year is required'],
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    salary: {
      type: Number,
    },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    careerPath: [
      {
        company: String,
        role: String,
        year: Number,
      },
    ],
    bio: { type: String, maxlength: 500 },
    isAvailableForMentorship: {
      type: Boolean,
      default: false,
    },
    email: { type: String, trim: true },
    adviceTopics: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

alumniProfileSchema.index({ department: 1 });
alumniProfileSchema.index({ batchYear: 1 });
alumniProfileSchema.index({ company: 1 });

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
