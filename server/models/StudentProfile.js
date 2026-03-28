const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    usn: {
      type: String,
      unique: true,
      required: [true, 'USN is required'],
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'],
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: 0,
      max: 10,
    },
    phone: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 7,
    },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    preferredCompanies: [{ type: String, trim: true }],
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        link: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        techStack: String,
        link: String,
      },
    ],
    semesterGrades: [
      {
        semester: { type: Number, min: 1, max: 8 },
        sgpa: { type: Number, min: 0, max: 10 },
        credits: { type: Number },
        backlogs: { type: Number, default: 0 },
      },
    ],
    preferredRoles: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    expectedPackage: { type: Number },
    resume: { type: String },
    placementStatus: {
      isPlaced: { type: Boolean, default: false },
      company: String,
      role: String,
      package: Number,
      offerLetterUrl: String,
    },
    performanceScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

studentProfileSchema.index({ department: 1 });
studentProfileSchema.index({ 'placementStatus.isPlaced': 1 });
studentProfileSchema.index({ cgpa: -1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
