const mongoose = require('mongoose');

const EventDiscussionPostSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramEvent',
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventDiscussionPost',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['webinar'],
      default: 'webinar',
    },
    authorName: {
      type: String,
      default: 'Anonymous',
      trim: true,
      maxlength: 60,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

EventDiscussionPostSchema.index({ event: 1, parent: 1, createdAt: -1 });

module.exports = mongoose.model('EventDiscussionPost', EventDiscussionPostSchema);
