const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const { matchJobs, resumeTips, careerSuggest } = require('../controllers/aiController');

router.use(protect, roleGuard('student'));

router.post('/match-jobs', matchJobs);
router.post('/resume-tips', resumeTips);
router.post('/career-suggest', careerSuggest);

module.exports = router;
