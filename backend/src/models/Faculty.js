const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: {
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subjects: [{
    type: String,
    ref: 'Subject'
  }],
  maxHoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
    default: 18
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  unavailableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    timeSlot: {
      start: String,
      end: String
    }
  }],
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
facultySchema.index({ facultyId: 1 });
facultySchema.index({ email: 1 });
facultySchema.index({ isActive: 1 });

// Virtual for getting assigned hours
facultySchema.virtual('assignedHours').get(function() {
  // This will be calculated based on current timetable assignments
  return this._assignedHours || 0;
});

facultySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Faculty', facultySchema);