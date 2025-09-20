const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slotIndex: {
    type: Number,
    required: true,
    min: 0
  },
  timeSlot: {
    start: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    }
  },
  subject: {
    type: String,
    ref: 'Subject',
    required: true
  },
  faculty: {
    type: String,
    ref: 'Faculty',
    required: true
  },
  room: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['Classroom', 'Laboratory'],
    required: true
  },
  class: {
    type: String,
    ref: 'Class',
    required: true
  },
  subjectType: {
    type: String,
    enum: ['Theory', 'Lab', 'Tutorial', 'Practical'],
    required: true
  }
});

const timetableSchema = new mongoose.Schema({
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  class: {
    type: String,
    ref: 'Class',
    required: true
  },
  generatedOn: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: String, // Could be user ID in future
    default: 'System'
  },
  schedule: [timetableSlotSchema],
  metadata: {
    totalHours: Number,
    conflictsResolved: Number,
    generationTime: Number, // in milliseconds
    algorithmVersion: {
      type: String,
      default: '1.0'
    }
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
timetableSchema.index({ semester: 1, class: 1 });
timetableSchema.index({ semester: 1, status: 1 });
timetableSchema.index({ isActive: 1, status: 1 });

// Index for schedule queries
timetableSchema.index({ 'schedule.day': 1, 'schedule.slotIndex': 1 });
timetableSchema.index({ 'schedule.faculty': 1 });
timetableSchema.index({ 'schedule.room': 1 });

// Virtual for weekly hours
timetableSchema.virtual('weeklyHours').get(function() {
  return this.schedule.length;
});

// Method to get schedule for a specific day
timetableSchema.methods.getScheduleForDay = function(day) {
  return this.schedule
    .filter(slot => slot.day === day)
    .sort((a, b) => a.slotIndex - b.slotIndex);
};

// Method to check for conflicts
timetableSchema.methods.findConflicts = function() {
  const conflicts = [];
  const schedule = this.schedule;

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const slot1 = schedule[i];
      const slot2 = schedule[j];

      if (slot1.day === slot2.day && slot1.slotIndex === slot2.slotIndex) {
        // Same time slot conflicts
        if (slot1.faculty === slot2.faculty) {
          conflicts.push({
            type: 'Faculty Conflict',
            details: `Faculty ${slot1.faculty} assigned to multiple classes`,
            slots: [slot1, slot2]
          });
        }
        if (slot1.room === slot2.room) {
          conflicts.push({
            type: 'Room Conflict',
            details: `Room ${slot1.room} assigned to multiple classes`,
            slots: [slot1, slot2]
          });
        }
      }
    }
  }

  return conflicts;
};

timetableSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Timetable', timetableSchema);