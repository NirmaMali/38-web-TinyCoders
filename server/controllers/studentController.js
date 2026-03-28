const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const MentorshipRequest = require('../models/MentorshipRequest');

// GET /api/student/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name email');
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Calculate performance score
  let score = 0;
  score += profile.cgpa * 5; // max 50
  score += Math.min(profile.skills.length * 2, 15); // max 15
  score += Math.min(profile.projects.length * 5, 15); // max 15
  score += Math.min(profile.internships.length * 5, 10); // max 10
  score += Math.min(profile.certifications.length * 2.5, 10); // max 10
  profile.performanceScore = Math.round(Math.min(score, 100));
  await profile.save();

  res.json({ success: true, data: profile });
});

// PUT /api/student/profile
const updateProfile = asyncHandler(async (req, res) => {
  const {
    skills, interests, preferredCompanies, github, linkedin, phone, semester,
    internships, certifications, projects, semesterGrades,
    preferredRoles, preferredLocations, expectedPackage
  } = req.body;

  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  if (skills !== undefined) profile.skills = skills;
  if (interests !== undefined) profile.interests = interests;
  if (preferredCompanies !== undefined) profile.preferredCompanies = preferredCompanies;
  if (github !== undefined) profile.github = github;
  if (linkedin !== undefined) profile.linkedin = linkedin;
  if (phone !== undefined) profile.phone = phone;
  if (semester !== undefined) profile.semester = semester;
  if (internships !== undefined) profile.internships = internships;
  if (certifications !== undefined) profile.certifications = certifications;
  if (projects !== undefined) profile.projects = projects;
  if (semesterGrades !== undefined) profile.semesterGrades = semesterGrades;
  if (preferredRoles !== undefined) profile.preferredRoles = preferredRoles;
  if (preferredLocations !== undefined) profile.preferredLocations = preferredLocations;
  if (expectedPackage !== undefined) profile.expectedPackage = expectedPackage;

  // Auto-calculate CGPA from semester grades if available
  if (semesterGrades && semesterGrades.length > 0) {
    const validGrades = semesterGrades.filter(g => g.sgpa > 0);
    if (validGrades.length > 0) {
      profile.cgpa = Math.round((validGrades.reduce((sum, g) => sum + g.sgpa, 0) / validGrades.length) * 100) / 100;
    }
  }

  await profile.save();

  res.json({ success: true, data: profile, message: 'Profile updated successfully' });
});

// GET /api/student/jobs — Enhanced smart matching
const getJobs = asyncHandler(async (req, res) => {
  const { type, minPackage, maxPackage } = req.query;

  const filter = { isActive: true, deadline: { $gte: new Date() } };
  if (type) filter.type = type;

  let jobs = await Job.find(filter).sort({ createdAt: -1 });
  const profile = await StudentProfile.findOne({ userId: req.user._id });

  // Enhanced weighted scoring
  jobs = jobs.map((job) => {
    const jobObj = job.toObject();
    let matchScore = 0;
    const breakdown = { skills: 0, cgpa: 0, interests: 0, roleMatch: 0, locationMatch: 0, experience: 0 };

    if (!profile) {
      jobObj.matchScore = 0;
      jobObj.matchBreakdown = breakdown;
      jobObj.isEligible = false;
      jobObj.hasApplied = false;
      return jobObj;
    }

    // 1. Skills overlap (35%)
    if (profile.skills.length > 0 && job.requiredSkills.length > 0) {
      const skillsLower = profile.skills.map(s => s.toLowerCase());
      const requiredLower = job.requiredSkills.map(s => s.toLowerCase());
      const overlap = skillsLower.filter(s => requiredLower.some(r => r.includes(s) || s.includes(r))).length;
      breakdown.skills = Math.round((overlap / requiredLower.length) * 35);
      matchScore += breakdown.skills;
    }

    // 2. CGPA eligibility (15%)
    if (profile.cgpa >= job.minCGPA) {
      const cgpaBonus = Math.min(((profile.cgpa - job.minCGPA) / 2) * 5, 5);
      breakdown.cgpa = Math.round(10 + cgpaBonus);
      matchScore += breakdown.cgpa;
    }

    // 3. Interests/domain match (20%)
    if (profile.interests.length > 0 && job.requiredSkills.length > 0) {
      const interestsLower = profile.interests.map(s => s.toLowerCase());
      const titleLower = job.title.toLowerCase();
      const descLower = (job.description || '').toLowerCase();
      const requiredLower = job.requiredSkills.map(s => s.toLowerCase());

      let interestMatches = 0;
      interestsLower.forEach(interest => {
        if (requiredLower.some(r => r.includes(interest) || interest.includes(r))) interestMatches++;
        if (titleLower.includes(interest) || descLower.includes(interest)) interestMatches++;
      });
      breakdown.interests = Math.round(Math.min((interestMatches / Math.max(interestsLower.length, 1)) * 20, 20));
      matchScore += breakdown.interests;
    }

    // 4. Preferred role match (15%)
    if (profile.preferredRoles && profile.preferredRoles.length > 0) {
      const rolesLower = profile.preferredRoles.map(r => r.toLowerCase());
      const titleLower = job.title.toLowerCase();
      if (rolesLower.some(r => titleLower.includes(r) || r.includes(titleLower.split(' ')[0]))) {
        breakdown.roleMatch = 15;
        matchScore += 15;
      } else if (rolesLower.some(r => job.requiredSkills.some(s => s.toLowerCase().includes(r)))) {
        breakdown.roleMatch = 8;
        matchScore += 8;
      }
    } else {
      // Partial credit if no preferences set
      breakdown.roleMatch = 5;
      matchScore += 5;
    }

    // 5. Location preference (5%)
    if (profile.preferredLocations && profile.preferredLocations.length > 0 && job.location) {
      const locsLower = profile.preferredLocations.map(l => l.toLowerCase());
      if (locsLower.some(l => job.location.toLowerCase().includes(l) || l.includes(job.location.toLowerCase()))) {
        breakdown.locationMatch = 5;
        matchScore += 5;
      }
    } else {
      breakdown.locationMatch = 2;
      matchScore += 2;
    }

    // 6. Experience relevance (10%) — internships + projects matching required skills
    if (job.requiredSkills.length > 0) {
      const requiredLower = job.requiredSkills.map(s => s.toLowerCase());
      let expRelevance = 0;

      // Check internships
      if (profile.internships && profile.internships.length > 0) {
        profile.internships.forEach(intern => {
          const text = `${intern.company} ${intern.role} ${intern.description || ''}`.toLowerCase();
          if (requiredLower.some(r => text.includes(r))) expRelevance += 2;
        });
      }

      // Check projects
      if (profile.projects && profile.projects.length > 0) {
        profile.projects.forEach(proj => {
          const text = `${proj.title} ${proj.techStack || ''} ${proj.description || ''}`.toLowerCase();
          if (requiredLower.some(r => text.includes(r))) expRelevance += 2;
        });
      }

      breakdown.experience = Math.min(Math.round(expRelevance), 10);
      matchScore += breakdown.experience;
    }

    jobObj.matchScore = Math.round(Math.min(matchScore, 100));
    jobObj.matchBreakdown = breakdown;
    jobObj.isEligible = profile.cgpa >= job.minCGPA;
    jobObj.hasApplied = job.applicants.some(a => a.studentId.toString() === req.user._id.toString());
    return jobObj;
  });

  // Sort by match score
  jobs.sort((a, b) => b.matchScore - a.matchScore);

  if (minPackage) jobs = jobs.filter(j => j.package >= parseFloat(minPackage));
  if (maxPackage) jobs = jobs.filter(j => j.package <= parseFloat(maxPackage));

  res.json({ success: true, data: jobs });
});

// POST /api/student/jobs/:id/apply
const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (!job.isActive) {
    res.status(400);
    throw new Error('This job is no longer accepting applications');
  }

  if (new Date() > job.deadline) {
    res.status(400);
    throw new Error('Application deadline has passed');
  }

  const alreadyApplied = job.applicants.some(
    (a) => a.studentId.toString() === req.user._id.toString()
  );
  if (alreadyApplied) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (profile && profile.cgpa < job.minCGPA) {
    res.status(400);
    throw new Error(`Minimum CGPA of ${job.minCGPA} required`);
  }

  job.applicants.push({ studentId: req.user._id, status: 'applied' });
  await job.save();

  await Notification.create({
    userId: req.user._id,
    message: `You have successfully applied to ${job.title} at ${job.company}`,
    type: 'success',
  });

  res.json({ success: true, message: 'Application submitted successfully' });
});

// GET /api/student/applications
const getApplications = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ 'applicants.studentId': req.user._id });

  const applications = jobs.map((job) => {
    const app = job.applicants.find(
      (a) => a.studentId.toString() === req.user._id.toString()
    );
    return {
      _id: app._id,
      jobId: job._id,
      title: job.title,
      company: job.company,
      package: job.package,
      type: job.type,
      status: app.status,
      appliedAt: app.appliedAt,
    };
  });

  res.json({ success: true, data: applications });
});

// GET /api/student/alumni
const browseAlumni = asyncHandler(async (req, res) => {
  const { department, company, batchYear, mentorOnly } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (company) filter.company = { $regex: company, $options: 'i' };
  if (batchYear) filter.batchYear = parseInt(batchYear);
  if (mentorOnly === 'true') filter.isAvailableForMentorship = true;

  const alumni = await AlumniProfile.find(filter)
    .populate('userId', 'name email isApproved')
    .sort({ createdAt: -1 });

  const approvedAlumni = alumni.filter((a) => a.userId && a.userId.isApproved);

  // Enrich with mentorship request status for current student
  const enriched = await Promise.all(
    approvedAlumni.map(async (a) => {
      const aObj = a.toObject();
      const existingRequest = await MentorshipRequest.findOne({
        studentId: req.user._id,
        alumniId: a.userId._id,
        status: { $in: ['pending', 'accepted'] },
      });
      aObj.mentorshipStatus = existingRequest ? existingRequest.status : null;
      return aObj;
    })
  );

  res.json({ success: true, data: enriched });
});

// GET /api/student/dashboard — Enhanced
const getDashboard = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  const applications = await Job.find({ 'applicants.studentId': req.user._id });
  const applicationCount = applications.reduce((acc, job) => {
    const app = job.applicants.find(a => a.studentId.toString() === req.user._id.toString());
    if (app) acc++;
    return acc;
  }, 0);

  // Profile completeness
  let completeness = 0;
  if (profile) {
    if (profile.skills.length > 0) completeness += 15;
    if (profile.interests.length > 0) completeness += 10;
    if (profile.github) completeness += 10;
    if (profile.linkedin) completeness += 10;
    if (profile.phone) completeness += 5;
    if (profile.internships.length > 0) completeness += 15;
    if (profile.projects.length > 0) completeness += 15;
    if (profile.certifications.length > 0) completeness += 10;
    if (profile.resume) completeness += 10;
    completeness = Math.min(completeness, 100);
  }

  // Top 3 matched jobs
  const activeJobs = await Job.find({ isActive: true, deadline: { $gte: new Date() } }).limit(3);

  // Eligible jobs count
  const allActiveJobs = await Job.find({ isActive: true, deadline: { $gte: new Date() } });
  const eligibleCount = profile
    ? allActiveJobs.filter(j => profile.cgpa >= j.minCGPA).length
    : 0;

  // Mentorship stats
  const mentorshipRequests = await MentorshipRequest.find({ studentId: req.user._id });
  const mentorshipStats = {
    total: mentorshipRequests.length,
    pending: mentorshipRequests.filter(r => r.status === 'pending').length,
    accepted: mentorshipRequests.filter(r => r.status === 'accepted').length,
    declined: mentorshipRequests.filter(r => r.status === 'declined').length,
  };

  // Academic progress (semester grades)
  const academicProgress = profile?.semesterGrades
    ?.sort((a, b) => a.semester - b.semester)
    .map(g => ({ semester: g.semester, sgpa: g.sgpa, backlogs: g.backlogs })) || [];

  res.json({
    success: true,
    data: {
      profile,
      notifications,
      applicationCount,
      profileCompleteness: completeness,
      suggestedJobs: activeJobs,
      eligibleCount,
      totalActiveJobs: allActiveJobs.length,
      mentorshipStats,
      academicProgress,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getJobs,
  applyToJob,
  getApplications,
  browseAlumni,
  getDashboard,
};
