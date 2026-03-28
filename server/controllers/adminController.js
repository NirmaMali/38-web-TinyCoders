const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const DEFAULT_STUDENT_PASSWORD = 'Student@123';

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await StudentProfile.countDocuments();
  const placedStudents = await StudentProfile.countDocuments({ 'placementStatus.isPlaced': true });
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const placedProfiles = await StudentProfile.find({ 'placementStatus.isPlaced': true });
  const avgPackage = placedProfiles.length > 0
    ? Math.round(placedProfiles.reduce((sum, p) => sum + (p.placementStatus.package || 0), 0) / placedProfiles.length * 100) / 100
    : 0;

  const topStudents = await StudentProfile.find()
    .sort({ performanceScore: -1 })
    .limit(5)
    .populate('userId', 'name email');

  const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);
  const totalJobs = await Job.countDocuments();
  const totalAlumni = await AlumniProfile.countDocuments();

  res.json({
    success: true,
    data: {
      totalStudents,
      placedStudents,
      placementRate,
      avgPackage,
      topStudents,
      recentJobs,
      totalJobs,
      totalAlumni,
    },
  });
});

// GET /api/admin/students
const getStudents = asyncHandler(async (req, res) => {
  const { department, status, minCgpa, maxCgpa, search, page = 1, limit = 20, sort = '-cgpa' } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (status === 'placed') filter['placementStatus.isPlaced'] = true;
  if (status === 'unplaced') filter['placementStatus.isPlaced'] = false;
  if (minCgpa) filter.cgpa = { ...filter.cgpa, $gte: parseFloat(minCgpa) };
  if (maxCgpa) filter.cgpa = { ...filter.cgpa, $lte: parseFloat(maxCgpa) };

  let query = StudentProfile.find(filter)
    .populate('userId', 'name email')
    .sort(sort)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  let students = await query;

  if (search) {
    students = students.filter(s =>
      s.usn.toLowerCase().includes(search.toLowerCase()) ||
      (s.userId && s.userId.name.toLowerCase().includes(search.toLowerCase()))
    );
  }

  const total = await StudentProfile.countDocuments(filter);

  res.json({
    success: true,
    data: {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// GET /api/admin/students/:id
const getStudentDetail = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email');
  if (!profile) {
    res.status(404);
    throw new Error('Student not found');
  }

  const applications = await Job.find({ 'applicants.studentId': profile.userId._id });
  const appList = applications.map((job) => {
    const app = job.applicants.find(a => a.studentId.toString() === profile.userId._id.toString());
    return { jobTitle: job.title, company: job.company, status: app.status, appliedAt: app.appliedAt };
  });

  res.json({
    success: true,
    data: { profile, applications: appList },
  });
});

// POST /api/admin/jobs
const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, requiredSkills, minCGPA, package: pkg, location, type, deadline } = req.body;

  if (!title || !company || !description || !pkg || !type || !deadline) {
    res.status(400);
    throw new Error('All required fields must be provided');
  }

  const job = await Job.create({
    title,
    company,
    description,
    requiredSkills: requiredSkills || [],
    minCGPA: minCGPA || 0,
    package: parseFloat(pkg),
    location,
    type,
    deadline: new Date(deadline),
    postedBy: req.user._id,
  });

  // Notify eligible students
  const students = await StudentProfile.find({ cgpa: { $gte: minCGPA || 0 } });
  const notifications = students.map((s) => ({
    userId: s.userId,
    message: `New job posted: ${title} at ${company} (${pkg} LPA)`,
    type: 'info',
  }));
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({ success: true, data: job, message: 'Job posted successfully' });
});

// PUT /api/admin/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const updates = req.body;
  if (updates.package) updates.package = parseFloat(updates.package);
  if (updates.minCGPA) updates.minCGPA = parseFloat(updates.minCGPA);
  if (updates.deadline) updates.deadline = new Date(updates.deadline);

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

  res.json({ success: true, data: updatedJob, message: 'Job updated successfully' });
});

// DELETE /api/admin/jobs/:id
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  await Job.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Job deleted successfully' });
});

// GET /api/admin/jobs
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'name');

  const jobsWithApplicants = await Promise.all(
    jobs.map(async (job) => {
      const jobObj = job.toObject();
      const populatedApplicants = await Promise.all(
        job.applicants.map(async (app) => {
          const profile = await StudentProfile.findOne({ userId: app.studentId }).populate('userId', 'name email');
          return {
            _id: app._id,
            studentId: app.studentId,
            name: profile?.userId?.name || 'Unknown',
            email: profile?.userId?.email || '',
            usn: profile?.usn || '',
            cgpa: profile?.cgpa || 0,
            status: app.status,
            appliedAt: app.appliedAt,
          };
        })
      );
      jobObj.applicants = populatedApplicants;
      return jobObj;
    })
  );

  res.json({ success: true, data: jobsWithApplicants });
});

// PUT /api/admin/applications/:id
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, jobId } = req.body;

  if (!['applied', 'shortlisted', 'rejected', 'placed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const applicant = job.applicants.id(req.params.id);
  if (!applicant) {
    res.status(404);
    throw new Error('Application not found');
  }

  applicant.status = status;
  await job.save();

  // If placed, update student profile
  if (status === 'placed') {
    await StudentProfile.findOneAndUpdate(
      { userId: applicant.studentId },
      {
        placementStatus: {
          isPlaced: true,
          company: job.company,
          role: job.title,
          package: job.package,
        },
      }
    );
  }

  // Send notification
  await Notification.create({
    userId: applicant.studentId,
    message: `Your application for ${job.title} at ${job.company} has been ${status}`,
    type: status === 'placed' ? 'success' : status === 'rejected' ? 'warning' : 'info',
  });

  res.json({ success: true, message: `Application ${status}` });
});

// GET /api/admin/alumni
const getAlumni = asyncHandler(async (req, res) => {
  const alumni = await AlumniProfile.find().populate('userId', 'name email isApproved');
  res.json({ success: true, data: alumni });
});

// PUT /api/admin/alumni/:id/approve
const approveAlumni = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const alumniProfile = await AlumniProfile.findById(req.params.id).populate('userId');

  if (!alumniProfile) {
    res.status(404);
    throw new Error('Alumni not found');
  }

  await User.findByIdAndUpdate(alumniProfile.userId._id, { isApproved: approve !== false });

  const statusMessage = approve !== false ? 'approved' : 'rejected';

  await Notification.create({
    userId: alumniProfile.userId._id,
    message: `Your alumni registration has been ${statusMessage}`,
    type: approve !== false ? 'success' : 'warning',
  });

  res.json({ success: true, message: `Alumni ${statusMessage} successfully` });
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const departments = ['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'];

  // Department-wise placement
  const deptData = await Promise.all(
    departments.map(async (dept) => {
      const total = await StudentProfile.countDocuments({ department: dept });
      const placed = await StudentProfile.countDocuments({ department: dept, 'placementStatus.isPlaced': true });
      return { department: dept, total, placed, rate: total > 0 ? Math.round((placed / total) * 100) : 0 };
    })
  );

  // Company-wise hiring
  const placedStudents = await StudentProfile.find({ 'placementStatus.isPlaced': true });
  const companyMap = {};
  placedStudents.forEach((s) => {
    const co = s.placementStatus.company || 'Unknown';
    companyMap[co] = (companyMap[co] || 0) + 1;
  });
  const companyData = Object.entries(companyMap).map(([name, value]) => ({ name, value }));

  // Package/salary trends
  const packageData = placedStudents.map((s) => ({
    company: s.placementStatus.company,
    package: s.placementStatus.package || 0,
    department: s.department,
  }));

  // Year-over-year (mock based on batch data)
  const yearData = [
    { year: '2021', rate: 72 },
    { year: '2022', rate: 78 },
    { year: '2023', rate: 82 },
    { year: '2024', rate: 85 },
  ];

  res.json({
    success: true,
    data: {
      departmentWise: deptData.filter(d => d.total > 0),
      companyWise: companyData,
      packageTrends: packageData,
      yearOverYear: yearData,
    },
  });
});

// POST /api/admin/add-student — Pre-load student academic data
const addStudentAcademic = asyncHandler(async (req, res) => {
  const { name, usn, semester, cgpa, email, department } = req.body;

  if (!name || !usn || !email || !department) {
    res.status(400);
    throw new Error('Name, USN, email, and department are required');
  }

  // Check if USN already exists
  const existingProfile = await StudentProfile.findOne({ usn: usn.toUpperCase() });
  if (existingProfile) {
    res.status(400);
    throw new Error(`Student with USN ${usn.toUpperCase()} already exists`);
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error(`Email ${email} is already registered`);
  }

  // Create User with default password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'student',
    isApproved: true,
  });

  // Create StudentProfile with academic data
  const profile = await StudentProfile.create({
    userId: user._id,
    usn: usn.toUpperCase(),
    department,
    cgpa: cgpa ? parseFloat(cgpa) : 0,
    semester: semester ? parseInt(semester) : 1,
  });

  // Send welcome notification
  await Notification.create({
    userId: user._id,
    message: `Welcome to PlaceIQ! Your account has been created by admin. Login with your USN (${usn.toUpperCase()}) and default password.`,
    type: 'info',
  });

  res.status(201).json({
    success: true,
    data: {
      user: { _id: user._id, name: user.name, email: user.email },
      profile: { _id: profile._id, usn: profile.usn, department: profile.department, cgpa: profile.cgpa, semester: profile.semester },
    },
    message: `Student ${name} (${usn.toUpperCase()}) added successfully. Default password: ${DEFAULT_STUDENT_PASSWORD}`,
  });
});

// POST /api/admin/add-students-bulk — Bulk add students
const addStudentsBulk = asyncHandler(async (req, res) => {
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    res.status(400);
    throw new Error('Provide an array of students');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

  const results = { success: [], failed: [] };

  for (const s of students) {
    try {
      if (!s.name || !s.usn || !s.email || !s.department) {
        results.failed.push({ usn: s.usn || 'N/A', reason: 'Missing required fields (name, usn, email, department)' });
        continue;
      }

      const existingProfile = await StudentProfile.findOne({ usn: s.usn.toUpperCase() });
      if (existingProfile) {
        results.failed.push({ usn: s.usn, reason: 'USN already exists' });
        continue;
      }

      const existingUser = await User.findOne({ email: s.email.toLowerCase() });
      if (existingUser) {
        results.failed.push({ usn: s.usn, reason: 'Email already registered' });
        continue;
      }

      const user = await User.create({
        name: s.name,
        email: s.email.toLowerCase(),
        password: hashedPassword,
        role: 'student',
        isApproved: true,
      });

      await StudentProfile.create({
        userId: user._id,
        usn: s.usn.toUpperCase(),
        department: s.department,
        cgpa: s.cgpa ? parseFloat(s.cgpa) : 0,
        semester: s.semester ? parseInt(s.semester) : 1,
      });

      results.success.push({ usn: s.usn.toUpperCase(), name: s.name });
    } catch (err) {
      results.failed.push({ usn: s.usn || 'N/A', reason: err.message });
    }
  }

  res.status(201).json({
    success: true,
    data: results,
    message: `${results.success.length} added, ${results.failed.length} failed`,
  });
});

module.exports = {
  getDashboard,
  getStudents,
  getStudentDetail,
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  updateApplicationStatus,
  getAlumni,
  approveAlumni,
  getAnalytics,
  addStudentAcademic,
  addStudentsBulk,
};
