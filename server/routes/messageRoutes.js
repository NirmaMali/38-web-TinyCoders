const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/auth');
const { sendMessage, getInbox, getConversation, markAsRead } = require('../controllers/messageController');

router.use(protect, roleGuard('student', 'alumni'));

router.post('/send', sendMessage);
router.get('/inbox', getInbox);
router.get('/:userId', getConversation);
router.put('/:messageId/read', markAsRead);

module.exports = router;
