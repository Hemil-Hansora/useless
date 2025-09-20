const Joi = require('joi');

// Faculty validation schema
const facultySchema = Joi.object({
  facultyId: Joi.string().required().trim(),
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().lowercase().trim(),
  subjects: Joi.array().items(Joi.string()).default([]),
  maxHoursPerWeek: Joi.number().integer().min(1).max(40).default(18),
  availableDays: Joi.array().items(
    Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  ).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  unavailableSlots: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      timeSlot: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
      }).required()
    })
  ).default([]),
  department: Joi.string().trim().allow(''),
  designation: Joi.string().trim().allow(''),
  phone: Joi.string().trim().allow(''),
  isActive: Joi.boolean().default(true)
});

// Subject validation schema
const subjectSchema = Joi.object({
  subjectId: Joi.string().required().trim(),
  name: Joi.string().required().trim().min(2).max(100),
  code: Joi.string().required().uppercase().trim().min(2).max(20),
  hoursPerWeek: Joi.number().integer().min(1).max(10).required(),
  type: Joi.string().valid('Theory', 'Lab', 'Tutorial', 'Practical').required(),
  semester: Joi.number().integer().min(1).max(8).required(),
  credits: Joi.number().integer().min(1).max(6).required(),
  department: Joi.string().trim().allow(''),
  description: Joi.string().trim().allow(''),
  prerequisites: Joi.array().items(Joi.string()).default([]),
  isElective: Joi.boolean().default(false),
  minClassSize: Joi.number().integer().min(1).default(1),
  maxClassSize: Joi.number().integer().min(1).default(60),
  requiresLab: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
});

// Semester validation schema
const semesterSchema = Joi.object({
  semesterName: Joi.string().required().trim().min(3).max(50),
  academicYear: Joi.string().required().trim(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  workingDays: Joi.array().items(
    Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  ).min(1).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  timeSlots: Joi.array().items(
    Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      label: Joi.string().trim().allow('')
    })
  ).default([
    { start: '09:00', end: '10:00', label: 'Period 1' },
    { start: '10:00', end: '11:00', label: 'Period 2' },
    { start: '11:15', end: '12:15', label: 'Period 3' },
    { start: '12:15', end: '13:15', label: 'Period 4' },
    { start: '14:00', end: '15:00', label: 'Period 5' },
    { start: '15:00', end: '16:00', label: 'Period 6' }
  ]),
  maxClassesPerDay: Joi.number().integer().min(1).max(10).default(6),
  holidays: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      name: Joi.string().required().trim(),
      description: Joi.string().trim().allow('')
    })
  ).default([]),
  examStartDate: Joi.date().allow(null),
  examEndDate: Joi.date().allow(null),
  isActive: Joi.boolean().default(true),
  isCurrent: Joi.boolean().default(false)
});

// Classroom validation schema
const classroomSchema = Joi.object({
  roomId: Joi.string().required().trim(),
  name: Joi.string().required().trim().min(2).max(100),
  capacity: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('Lecture Hall', 'Classroom', 'Seminar Room', 'Auditorium').required(),
  building: Joi.string().trim().allow(''),
  floor: Joi.number().integer().allow(null),
  facilities: Joi.array().items(
    Joi.string().valid('Projector', 'Whiteboard', 'Computer', 'Audio System', 'Air Conditioning', 'Wi-Fi')
  ).default([]),
  isActive: Joi.boolean().default(true)
});

// Laboratory validation schema
const laboratorySchema = Joi.object({
  labId: Joi.string().required().trim(),
  name: Joi.string().required().trim().min(2).max(100),
  capacity: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('Computer Lab', 'Science Lab', 'Engineering Lab', 'Language Lab', 'Research Lab').required(),
  building: Joi.string().trim().allow(''),
  floor: Joi.number().integer().allow(null),
  equipment: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      quantity: Joi.number().integer().min(0).required(),
      condition: Joi.string().valid('Excellent', 'Good', 'Fair', 'Poor').default('Good')
    })
  ).default([]),
  software: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim(),
      version: Joi.string().trim().allow(''),
      licenseCount: Joi.number().integer().min(0).allow(null)
    })
  ).default([]),
  isActive: Joi.boolean().default(true)
});

// Class validation schema
const classSchema = Joi.object({
  classId: Joi.string().required().trim(),
  name: Joi.string().required().trim().min(2).max(100),
  batch: Joi.string().required().trim(),
  strength: Joi.number().integer().min(1).required(),
  semester: Joi.number().integer().min(1).max(8).required(),
  department: Joi.string().required().trim(),
  program: Joi.string().required().trim(),
  section: Joi.string().trim().allow(''),
  classTeacher: Joi.string().allow(null),
  subjects: Joi.array().items(Joi.string()).default([]),
  isActive: Joi.boolean().default(true)
});

// Validation middleware functions
const validateFaculty = (req, res, next) => {
  const { error, value } = facultySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  req.body = value;
  next();
};

const validateSubject = (req, res, next) => {
  const { error, value } = subjectSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  req.body = value;
  next();
};

const validateSemester = (req, res, next) => {
  const { error, value } = semesterSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  req.body = value;
  next();
};

const validateResource = (type) => {
  return (req, res, next) => {
    let schema;
    
    switch (type) {
      case 'classroom':
        schema = classroomSchema;
        break;
      case 'laboratory':
        schema = laboratorySchema;
        break;
      case 'class':
        schema = classSchema;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid resource type'
        });
    }
    
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validateFaculty,
  validateSubject,
  validateSemester,
  validateResource
};