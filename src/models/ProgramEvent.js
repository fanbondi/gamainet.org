const mongoose = require('mongoose');

const SpeakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: '' },
    org: { type: String, default: '' },
    topic: { type: String, default: '' },
    photo: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    time: { type: String, default: '' },
    title: { type: String, default: '' },
    speaker: { type: String, default: '' },
  },
  { _id: false }
);

const AgendaDaySchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    date: { type: String, default: '' },
    sessions: { type: [SessionSchema], default: [] },
  },
  { _id: false }
);

const ProgramEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['meetup', 'indabax', 'webinar'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, default: '' },
    description: { type: mongoose.Schema.Types.Mixed, default: null },
    theme: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    location: { type: String, default: '' },
    venue: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    timeInfo: { type: String, default: '' },
    year: { type: Number },
    speakers: { type: [SpeakerSchema], default: [] },
    agenda: { type: [AgendaDaySchema], default: [] },
    registrationOpen: { type: Boolean, default: true },
    externalRegistrationUrl: { type: String, default: '' },
    meetingUrl: { type: String, default: '' },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProgramEventSchema.index({ type: 1, startDate: -1 });

module.exports = mongoose.model('ProgramEvent', ProgramEventSchema);
