const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const { getProfile, updateProfile, viewStudents, getCareerTimeline } = require('../controllers/alumniController');
const { getIncomingRequests, respondToRequest } = require('../controllers/mentorshipController');

router.use(protect, roleGuard('alumni'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/students', viewStudents);
router.get('/career-timeline', getCareerTimeline);
router.get('/mentorship/requests', getIncomingRequests);
router.put('/mentorship/requests/:id', respondToRequest);

module.exports = router;
