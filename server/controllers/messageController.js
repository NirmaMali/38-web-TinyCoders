const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');

// POST /api/messages/send
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Receiver and content are required');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content,
  });

  res.status(201).json({ success: true, data: message, message: 'Message sent' });
});

// GET /api/messages/inbox
const getInbox = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name email role')
    .populate('receiverId', 'name email role');

  // Group by conversation partner
  const conversationMap = {};
  messages.forEach((msg) => {
    const partnerId =
      msg.senderId._id.toString() === req.user._id.toString()
        ? msg.receiverId._id.toString()
        : msg.senderId._id.toString();

    if (!conversationMap[partnerId]) {
      const partner =
        msg.senderId._id.toString() === req.user._id.toString()
          ? msg.receiverId
          : msg.senderId;
      conversationMap[partnerId] = {
        partnerId,
        partnerName: partner.name,
        partnerRole: partner.role,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
      };
    }

    if (
      msg.receiverId._id.toString() === req.user._id.toString() &&
      !msg.isRead
    ) {
      conversationMap[partnerId].unreadCount++;
    }
  });

  const conversations = Object.values(conversationMap).sort(
    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
  );

  res.json({ success: true, data: conversations });
});

// GET /api/messages/:userId
const getConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user._id, receiverId: req.params.userId },
      { senderId: req.params.userId, receiverId: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name role')
    .populate('receiverId', 'name role');

  // Mark messages as read
  await Message.updateMany(
    { senderId: req.params.userId, receiverId: req.user._id, isRead: false },
    { isRead: true }
  );

  const partner = await User.findById(req.params.userId).select('name email role');

  res.json({ success: true, data: { messages, partner } });
});

// PUT /api/messages/:messageId/read
const markAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.receiverId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  message.isRead = true;
  await message.save();

  res.json({ success: true, message: 'Marked as read' });
});

module.exports = { sendMessage, getInbox, getConversation, markAsRead };
