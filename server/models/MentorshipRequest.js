const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
      required: [true, 'Please include a message with your request'],
    },
    topic: {
      type: String,
      required: [true, 'Please select a topic'],
      enum: [
        'Career Guidance',
        'Interview Prep',
        'Resume Review',
        'Higher Studies',
        'Career Switch',
        'Skill Development',
        'Company Insights',
        'General Advice',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    response: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ studentId: 1, alumniId: 1 });
mentorshipRequestSchema.index({ alumniId: 1, status: 1 });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
