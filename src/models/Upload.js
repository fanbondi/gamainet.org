const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number },
  mimetype: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Upload', UploadSchema);
