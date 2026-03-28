const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: notifications });
});

// PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAllAsRead };
