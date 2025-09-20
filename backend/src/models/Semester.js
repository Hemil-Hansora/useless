const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }],
  timeSlots: [{
    start: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    label: {
      type: String,
      trim: true
    }
  }],
  maxClassesPerDay: {
    type: Number,
    default: 6,
    min: 1,
    max: 10
  },
  holidays: [{
    date: Date,
    name: String,
    description: String
  }],
  examStartDate: {
    type: Date
  },
  examEndDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
semesterSchema.index({ academicYear: 1 });
semesterSchema.index({ isActive: 1 });
semesterSchema.index({ isCurrent: 1 });

// Virtual for semester duration
semesterSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure only one current semester
semesterSchema.pre('save', async function(next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

semesterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Semester', semesterSchema);