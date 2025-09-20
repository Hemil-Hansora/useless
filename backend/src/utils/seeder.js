const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const { Classroom, Laboratory, Class } = require('../models/Resource');

// Sample data
const sampleFaculty = [
  {
    facultyId: 'F001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    subjects: ['CS101', 'CS102'],
    maxHoursPerWeek: 20,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    department: 'Computer Science',
    designation: 'Professor'
  },
  {
    facultyId: 'F002',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    subjects: ['CS103', 'CS201'],
    maxHoursPerWeek: 18,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    department: 'Computer Science',
    designation: 'Associate Professor'
  },
  {
    facultyId: 'F003',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@university.edu',
    subjects: ['MATH101', 'MATH102'],
    maxHoursPerWeek: 16,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    department: 'Mathematics',
    designation: 'Assistant Professor'
  }
];

const sampleSubjects = [
  {
    subjectId: 'CS101',
    name: 'Data Structures',
    code: 'CS101',
    hoursPerWeek: 4,
    type: 'Theory',
    semester: 3,
    credits: 4,
    department: 'Computer Science'
  },
  {
    subjectId: 'CS102',
    name: 'Database Systems',
    code: 'CS102',
    hoursPerWeek: 3,
    type: 'Theory',
    semester: 3,
    credits: 3,
    department: 'Computer Science'
  },
  {
    subjectId: 'CS103',
    name: 'Programming Lab',
    code: 'CS103',
    hoursPerWeek: 2,
    type: 'Lab',
    semester: 3,
    credits: 2,
    department: 'Computer Science',
    requiresLab: true
  },
  {
    subjectId: 'CS201',
    name: 'Advanced Algorithms',
    code: 'CS201',
    hoursPerWeek: 4,
    type: 'Theory',
    semester: 4,
    credits: 4,
    department: 'Computer Science',
    prerequisites: ['CS101']
  },
  {
    subjectId: 'MATH101',
    name: 'Calculus I',
    code: 'MATH101',
    hoursPerWeek: 3,
    type: 'Theory',
    semester: 1,
    credits: 3,
    department: 'Mathematics'
  },
  {
    subjectId: 'MATH102',
    name: 'Linear Algebra',
    code: 'MATH102',
    hoursPerWeek: 3,
    type: 'Theory',
    semester: 2,
    credits: 3,
    department: 'Mathematics'
  }
];

const sampleSemester = {
  semesterName: 'Fall 2024',
  academicYear: '2024-2025',
  startDate: new Date('2024-09-01'),
  endDate: new Date('2024-12-20'),
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timeSlots: [
    { start: '09:00', end: '10:00', label: 'Period 1' },
    { start: '10:00', end: '11:00', label: 'Period 2' },
    { start: '11:15', end: '12:15', label: 'Period 3' },
    { start: '12:15', end: '13:15', label: 'Period 4' },
    { start: '14:00', end: '15:00', label: 'Period 5' },
    { start: '15:00', end: '16:00', label: 'Period 6' }
  ],
  maxClassesPerDay: 6,
  isCurrent: true
};

const sampleClassrooms = [
  {
    roomId: 'R101',
    name: 'Room 101',
    capacity: 60,
    type: 'Lecture Hall',
    building: 'Main Building',
    floor: 1,
    facilities: ['Projector', 'Whiteboard', 'Air Conditioning']
  },
  {
    roomId: 'R102',
    name: 'Room 102',
    capacity: 40,
    type: 'Classroom',
    building: 'Main Building',
    floor: 1,
    facilities: ['Whiteboard', 'Air Conditioning']
  },
  {
    roomId: 'R201',
    name: 'Room 201',
    capacity: 50,
    type: 'Classroom',
    building: 'Main Building',
    floor: 2,
    facilities: ['Projector', 'Whiteboard']
  }
];

const sampleLaboratories = [
  {
    labId: 'L201',
    name: 'Computer Lab 1',
    capacity: 30,
    type: 'Computer Lab',
    building: 'Tech Building',
    floor: 2,
    equipment: [
      { name: 'Desktop Computers', quantity: 30, condition: 'Good' },
      { name: 'Projector', quantity: 1, condition: 'Excellent' }
    ],
    software: [
      { name: 'Visual Studio Code', version: '1.85.0', licenseCount: 30 },
      { name: 'Node.js', version: '18.0.0', licenseCount: null }
    ]
  },
  {
    labId: 'L202',
    name: 'Physics Lab',
    capacity: 25,
    type: 'Science Lab',
    building: 'Science Building',
    floor: 2,
    equipment: [
      { name: 'Microscopes', quantity: 15, condition: 'Good' },
      { name: 'Lab Benches', quantity: 25, condition: 'Excellent' }
    ]
  }
];

const sampleClasses = [
  {
    classId: 'CS3A',
    name: 'Computer Science 3rd Year A',
    batch: 'CS-3A',
    strength: 45,
    semester: 3,
    department: 'Computer Science',
    program: 'B.Tech Computer Science',
    section: 'A',
    subjects: ['CS101', 'CS102', 'CS103']
  },
  {
    classId: 'CS3B',
    name: 'Computer Science 3rd Year B',
    batch: 'CS-3B',
    strength: 40,
    semester: 3,
    department: 'Computer Science',
    program: 'B.Tech Computer Science',
    section: 'B',
    subjects: ['CS101', 'CS102', 'CS103']
  },
  {
    classId: 'CS4A',
    name: 'Computer Science 4th Year A',
    batch: 'CS-4A',
    strength: 38,
    semester: 4,
    department: 'Computer Science',
    program: 'B.Tech Computer Science',
    section: 'A',
    subjects: ['CS201']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      Faculty.deleteMany({}),
      Subject.deleteMany({}),
      Semester.deleteMany({}),
      Classroom.deleteMany({}),
      Laboratory.deleteMany({}),
      Class.deleteMany({})
    ]);

    console.log('🧹 Cleared existing data');

    // Insert sample data
    await Promise.all([
      Faculty.insertMany(sampleFaculty),
      Subject.insertMany(sampleSubjects),
      Semester.create(sampleSemester),
      Classroom.insertMany(sampleClassrooms),
      Laboratory.insertMany(sampleLaboratories),
      Class.insertMany(sampleClasses)
    ]);

    console.log('✅ Sample data inserted successfully');
    console.log(`📚 Inserted ${sampleFaculty.length} faculty members`);
    console.log(`📖 Inserted ${sampleSubjects.length} subjects`);
    console.log(`📅 Inserted 1 semester`);
    console.log(`🏫 Inserted ${sampleClassrooms.length} classrooms`);
    console.log(`🔬 Inserted ${sampleLaboratories.length} laboratories`);
    console.log(`👥 Inserted ${sampleClasses.length} classes`);

    return {
      success: true,
      message: 'Database seeded successfully'
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  const connectDB = require('../config/database');
  
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedDatabase,
  sampleFaculty,
  sampleSubjects,
  sampleSemester,
  sampleClassrooms,
  sampleLaboratories,
  sampleClasses
};