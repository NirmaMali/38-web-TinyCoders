const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');
const { getPredictiveAnalytics } = require('../controllers/externalJobsController');

router.use(protect, roleGuard('admin'));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.get('/students/:id', getStudentDetail);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/jobs', getJobs);
router.put('/applications/:id', updateApplicationStatus);
router.get('/alumni', getAlumni);
router.put('/alumni/:id/approve', approveAlumni);
router.get('/analytics', getAnalytics);
router.get('/predictive-analytics', getPredictiveAnalytics);
router.post('/add-student', addStudentAcademic);
router.post('/add-students-bulk', addStudentsBulk);

module.exports = router;
