const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const { getExternalJobs } = require('../controllers/externalJobsController');

// External jobs — requires login but any role can access
router.get('/', protect, getExternalJobs);

module.exports = router;
