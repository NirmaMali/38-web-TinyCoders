const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getJobs,
  applyToJob,
  getApplications,
  browseAlumni,
  getDashboard,
} = require('../controllers/studentController');
const { createRequest, getMyRequests } = require('../controllers/mentorshipController');
const { getStudentCareerInsights } = require('../controllers/externalJobsController');

router.use(protect, roleGuard('student'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/jobs', getJobs);
router.post('/jobs/:id/apply', applyToJob);
router.get('/applications', getApplications);
router.get('/alumni', browseAlumni);
router.post('/mentorship/request', createRequest);
router.get('/mentorship/requests', getMyRequests);
router.get('/career-insights', getStudentCareerInsights);

module.exports = router;
