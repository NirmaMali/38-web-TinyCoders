const asyncHandler = require('express-async-handler');
const AlumniProfile = require('../models/AlumniProfile');
const StudentProfile = require('../models/StudentProfile');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');

// GET /api/alumni/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await AlumniProfile.findOne({ userId: req.user._id }).populate('userId', 'name email');
  if (!profile) {
    res.status(404);
    throw new Error('Alumni profile not found');
  }

  // Include mentorship stats
  const mentorshipCount = await MentorshipRequest.countDocuments({ alumniId: req.user._id });
  const pendingCount = await MentorshipRequest.countDocuments({ alumniId: req.user._id, status: 'pending' });
  const acceptedCount = await MentorshipRequest.countDocuments({ alumniId: req.user._id, status: 'accepted' });

  const profileObj = profile.toObject();
  profileObj.mentorshipStats = { total: mentorshipCount, pending: pendingCount, accepted: acceptedCount };

  res.json({ success: true, data: profileObj });
});

// PUT /api/alumni/profile
const updateProfile = asyncHandler(async (req, res) => {
  const {
    company, jobRole, salary, linkedin, github, careerPath, bio,
    isAvailableForMentorship, department, batchYear, adviceTopics, specializations
  } = req.body;

  const profile = await AlumniProfile.findOne({ userId: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Alumni profile not found');
  }

  if (company !== undefined) profile.company = company;
  if (jobRole !== undefined) profile.jobRole = jobRole;
  if (salary !== undefined) profile.salary = salary;
  if (linkedin !== undefined) profile.linkedin = linkedin;
  if (github !== undefined) profile.github = github;
  if (careerPath !== undefined) profile.careerPath = careerPath;
  if (bio !== undefined) profile.bio = bio;
  if (isAvailableForMentorship !== undefined) profile.isAvailableForMentorship = isAvailableForMentorship;
  if (department !== undefined) profile.department = department;
  if (batchYear !== undefined) profile.batchYear = batchYear;
  if (adviceTopics !== undefined) profile.adviceTopics = adviceTopics;
  if (specializations !== undefined) profile.specializations = specializations;

  await profile.save();

  res.json({ success: true, data: profile, message: 'Profile updated successfully' });
});

// GET /api/alumni/students
const viewStudents = asyncHandler(async (req, res) => {
  const students = await StudentProfile.find()
    .populate('userId', 'name email')
    .sort({ performanceScore: -1 });

  res.json({ success: true, data: students });
});

// GET /api/alumni/career-timeline
const getCareerTimeline = asyncHandler(async (req, res) => {
  const profile = await AlumniProfile.findOne({ userId: req.user._id }).populate('userId', 'name');
  if (!profile) {
    res.status(404);
    throw new Error('Alumni profile not found');
  }

  const timeline = (profile.careerPath || [])
    .sort((a, b) => a.year - b.year)
    .map((step, index, arr) => ({
      ...step.toObject ? step.toObject() : step,
      isCurrent: index === arr.length - 1,
      duration: index < arr.length - 1 ? `${arr[index + 1].year - step.year} year(s)` : 'Present',
    }));

  res.json({
    success: true,
    data: {
      name: profile.userId?.name,
      department: profile.department,
      batchYear: profile.batchYear,
      timeline,
      currentRole: profile.jobRole,
      currentCompany: profile.company,
    },
  });
});

module.exports = { getProfile, updateProfile, viewStudents, getCareerTimeline };
