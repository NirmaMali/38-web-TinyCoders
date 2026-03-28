const asyncHandler = require('express-async-handler');
const MentorshipRequest = require('../models/MentorshipRequest');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /api/student/mentorship/request
const createRequest = asyncHandler(async (req, res) => {
  const { alumniId, message, topic } = req.body;

  if (!alumniId || !message || !topic) {
    res.status(400);
    throw new Error('Alumni ID, message, and topic are required');
  }

  // Verify alumni exists and is available for mentorship
  const alumniProfile = await AlumniProfile.findOne({ userId: alumniId });
  if (!alumniProfile) {
    res.status(404);
    throw new Error('Alumni not found');
  }

  if (!alumniProfile.isAvailableForMentorship) {
    res.status(400);
    throw new Error('This alumni is not currently available for mentorship');
  }

  // Check for existing pending request
  const existing = await MentorshipRequest.findOne({
    studentId: req.user._id,
    alumniId,
    status: 'pending',
  });

  if (existing) {
    res.status(400);
    throw new Error('You already have a pending request with this alumni');
  }

  const request = await MentorshipRequest.create({
    studentId: req.user._id,
    alumniId,
    message,
    topic,
  });

  // Notify the alumni
  const student = await User.findById(req.user._id);
  await Notification.create({
    userId: alumniId,
    message: `${student.name} has requested mentorship on "${topic}"`,
    type: 'info',
  });

  res.status(201).json({
    success: true,
    data: request,
    message: 'Mentorship request sent successfully',
  });
});

// GET /api/student/mentorship/requests
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await MentorshipRequest.find({ studentId: req.user._id })
    .populate('alumniId', 'name email')
    .sort({ createdAt: -1 });

  // Enrich with alumni profile data
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const rObj = r.toObject();
      const alumniProfile = await AlumniProfile.findOne({ userId: r.alumniId._id });
      rObj.alumniProfile = alumniProfile
        ? { company: alumniProfile.company, jobRole: alumniProfile.jobRole, department: alumniProfile.department }
        : null;
      return rObj;
    })
  );

  res.json({ success: true, data: enriched });
});

// GET /api/alumni/mentorship/requests
const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await MentorshipRequest.find({ alumniId: req.user._id })
    .populate('studentId', 'name email')
    .sort({ createdAt: -1 });

  // Enrich with student profile data
  const StudentProfile = require('../models/StudentProfile');
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const rObj = r.toObject();
      const studentProfile = await StudentProfile.findOne({ userId: r.studentId._id });
      rObj.studentProfile = studentProfile
        ? { department: studentProfile.department, cgpa: studentProfile.cgpa, skills: studentProfile.skills, semester: studentProfile.semester }
        : null;
      return rObj;
    })
  );

  res.json({ success: true, data: enriched });
});

// PUT /api/alumni/mentorship/requests/:id
const respondToRequest = asyncHandler(async (req, res) => {
  const { status, response } = req.body;

  if (!['accepted', 'declined'].includes(status)) {
    res.status(400);
    throw new Error('Status must be accepted or declined');
  }

  const request = await MentorshipRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.alumniId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (request.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been responded to');
  }

  request.status = status;
  if (response) request.response = response;
  await request.save();

  // Notify the student
  const alumni = await User.findById(req.user._id);
  await Notification.create({
    userId: request.studentId,
    message: `${alumni.name} has ${status} your mentorship request on "${request.topic}"${response ? ': ' + response : ''}`,
    type: status === 'accepted' ? 'success' : 'warning',
  });

  res.json({ success: true, data: request, message: `Request ${status}` });
});

module.exports = { createRequest, getMyRequests, getIncomingRequests, respondToRequest };
