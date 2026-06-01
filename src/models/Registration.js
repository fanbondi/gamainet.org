const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramEvent',
      required: true,
      index: true,
    },
    eventType: { type: String, default: '' },
    eventTitle: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    organisation: { type: String, default: '' },
    role: { type: String, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

RegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
