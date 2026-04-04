const mongoose = require('mongoose');

// Classroom Schema
const classroomSchema = new mongoose.Schema({
  roomId: {
    type: String,
   
    trim: true
  },
  name: {
    type: String,
   
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['Lecture Hall', 'Classroom', 'Seminar Room', 'Auditorium']
  },
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: Number
  },
  facilities: [{
    type: String,
    enum: ['Projector', 'Whiteboard', 'Computer', 'Audio System', 'Air Conditioning', 'Wi-Fi']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Laboratory Schema
const laboratorySchema = new mongoose.Schema({
  labId: {
    type: String,
    
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['Computer Lab', 'Science Lab', 'Engineering Lab', 'Language Lab', 'Research Lab']
  },
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: Number
  },
  equipment: [{
    name: String,
    quantity: Number,
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    }
  }],
  software: [{
    name: String,
    version: String,
    licenseCount: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Class/Batch Schema
const classSchema = new mongoose.Schema({
  classId: {
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
  batch: {
    type: String,
    required: true,
    trim: true
  },
  strength: {
    type: Number,
    required: true,
    min: 1
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  classTeacher: {
    type: String,
    ref: 'Faculty'
  },
  subjects: [{
    type: String,
    ref: 'Subject'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
classroomSchema.index({ roomId: 1 });
classroomSchema.index({ type: 1 });
classroomSchema.index({ isActive: 1 });

laboratorySchema.index({ labId: 1 });
laboratorySchema.index({ type: 1 });
laboratorySchema.index({ isActive: 1 });

classSchema.index({ classId: 1 });
classSchema.index({ semester: 1 });
classSchema.index({ department: 1 });
classSchema.index({ isActive: 1 });

const Classroom = mongoose.model('Classroom', classroomSchema);
const Laboratory = mongoose.model('Laboratory', laboratorySchema);
const Class = mongoose.model('Class', classSchema);

module.exports = {
  Classroom,
  Laboratory,
  Class
};