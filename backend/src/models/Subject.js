const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  type: {
    type: String,
    required: true,
    enum: ['Theory', 'Lab', 'Tutorial', 'Practical']
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  department: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  prerequisites: [{
    type: String,
    ref: 'Subject'
  }],
  isElective: {
    type: Boolean,
    default: false
  },
  minClassSize: {
    type: Number,
    default: 1
  },
  maxClassSize: {
    type: Number,
    default: 60
  },
  requiresLab: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
subjectSchema.index({ subjectId: 1 });
subjectSchema.index({ code: 1 });
subjectSchema.index({ semester: 1 });
subjectSchema.index({ type: 1 });
subjectSchema.index({ isActive: 1 });

// Compound index for common queries
subjectSchema.index({ semester: 1, type: 1 });

module.exports = mongoose.model('Subject', subjectSchema);