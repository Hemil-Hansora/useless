const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const { Classroom, Laboratory, Class } = require('../models/Resource');
const Timetable = require('../models/Timetable');

class TimetableGenerator {
  constructor() {
    this.conflicts = [];
    this.generationStartTime = null;
  }

  async generateTimetable(data) {
    this.generationStartTime = Date.now();
    this.conflicts = [];

    try {
      const {
        semesterId,
        classIds = [],
        maxIterations = 1000,
        prioritizeTheory = true
      } = data;

      // Fetch semester data
      const semester = await Semester.findById(semesterId);
      if (!semester) {
        throw new Error('Semester not found');
      }

      // Fetch all required data
      const [classes, subjects, faculty, classrooms, laboratories] = await Promise.all([
        Class.find({ classId: { $in: classIds }, isActive: true }).populate('subjects'),
        Subject.find({ isActive: true }),
        Faculty.find({ isActive: true }),
        Classroom.find({ isActive: true }),
        Laboratory.find({ isActive: true })
      ]);

      if (classes.length === 0) {
        throw new Error('No valid classes found');
      }

      const allRooms = [...classrooms, ...laboratories];
      const generatedTimetables = [];

      // Generate timetable for each class
      for (const classData of classes) {
        const timetable = await this.generateClassTimetable(
          classData,
          semester,
          subjects,
          faculty,
          allRooms,
          maxIterations,
          prioritizeTheory
        );
        generatedTimetables.push(timetable);
      }

      const generationTime = Date.now() - this.generationStartTime;

      return {
        success: true,
        data: generatedTimetables,
        metadata: {
          generationTime,
          conflictsResolved: this.conflicts.length,
          algorithmVersion: '1.0'
        }
      };

    } catch (error) {
      throw new Error(`Timetable generation failed: ${error.message}`);
    }
  }

  async generateClassTimetable(classData, semester, subjects, faculty, allRooms, maxIterations, prioritizeTheory) {
    const schedule = [];
    const globalRoomUsage = new Map(); // Track room usage across all time slots
    const facultyUsage = new Map(); // Track faculty usage across all time slots

    // Initialize usage tracking
    semester.workingDays.forEach(day => {
      semester.timeSlots.forEach((slot, slotIndex) => {
        const timeKey = `${day}-${slotIndex}`;
        globalRoomUsage.set(timeKey, new Set());
        facultyUsage.set(timeKey, new Set());
      });
    });

    // Get subjects for this class
    const classSubjects = subjects.filter(subject => 
      classData.subjects.includes(subject.subjectId) && subject.isActive
    );

    if (classSubjects.length === 0) {
      throw new Error(`No subjects found for class ${classData.name}`);
    }

    // Sort subjects by priority (Theory first if prioritizeTheory is true)
    const sortedSubjects = [...classSubjects].sort((a, b) => {
      if (prioritizeTheory) {
        if (a.type === 'Theory' && b.type !== 'Theory') return -1;
        if (a.type !== 'Theory' && b.type === 'Theory') return 1;
      }
      return b.hoursPerWeek - a.hoursPerWeek; // Higher hours first
    });

    // Generate schedule for each subject
    for (const subject of sortedSubjects) {
      await this.assignSubjectToSchedule(
        subject,
        classData,
        semester,
        faculty,
        allRooms,
        schedule,
        globalRoomUsage,
        facultyUsage,
        maxIterations
      );
    }

    // Create and save timetable
    const timetable = new Timetable({
      semester: semester._id,
      class: classData.classId,
      schedule,
      metadata: {
        totalHours: schedule.length,
        conflictsResolved: this.conflicts.length,
        generationTime: Date.now() - this.generationStartTime,
        algorithmVersion: '1.0'
      },
      status: 'Draft'
    });

    await timetable.save();
    return timetable;
  }

  async assignSubjectToSchedule(subject, classData, semester, faculty, allRooms, schedule, globalRoomUsage, facultyUsage, maxIterations) {
    const subjectFaculty = faculty.filter(f => 
      f.subjects.includes(subject.subjectId) && f.isActive
    );

    if (subjectFaculty.length === 0) {
      console.warn(`No faculty found for subject ${subject.name}`);
      return;
    }

    const requiredRooms = this.getAppropriateRooms(subject, allRooms, classData.strength);
    let hoursAssigned = 0;
    let iterations = 0;

    // Create all possible time slots and shuffle them for better distribution
    const timeSlots = [];
    semester.workingDays.forEach(day => {
      semester.timeSlots.forEach((timeSlot, slotIndex) => {
        timeSlots.push({ day, slotIndex, timeSlot });
      });
    });

    // Shuffle for better distribution
    this.shuffleArray(timeSlots);

    while (hoursAssigned < subject.hoursPerWeek && iterations < maxIterations) {
      iterations++;
      let assigned = false;

      for (const { day, slotIndex, timeSlot } of timeSlots) {
        if (hoursAssigned >= subject.hoursPerWeek) break;

        const timeKey = `${day}-${slotIndex}`;

        // Check if this slot is already occupied for this class
        if (this.isSlotOccupied(schedule, day, slotIndex)) continue;

        // Find available faculty
        const availableFaculty = this.findAvailableFaculty(
          subjectFaculty,
          day,
          slotIndex,
          facultyUsage.get(timeKey)
        );

        if (!availableFaculty) continue;

        // Find available room
        const availableRoom = this.findAvailableRoom(
          requiredRooms,
          globalRoomUsage.get(timeKey)
        );

        if (!availableRoom) continue;

        // Assign the slot
        const scheduleSlot = {
          day,
          slotIndex,
          timeSlot,
          subject: subject.subjectId,
          faculty: availableFaculty.facultyId,
          room: availableRoom.roomId || availableRoom.labId,
          roomType: availableRoom.roomId ? 'Classroom' : 'Laboratory',
          class: classData.classId,
          subjectType: subject.type
        };

        schedule.push(scheduleSlot);
        
        // Update usage tracking
        globalRoomUsage.get(timeKey).add(availableRoom.roomId || availableRoom.labId);
        facultyUsage.get(timeKey).add(availableFaculty.facultyId);

        hoursAssigned++;
        assigned = true;

        // Remove this slot from available slots to avoid reassignment
        const slotIndex_toRemove = timeSlots.findIndex(slot => 
          slot.day === day && slot.slotIndex === slotIndex
        );
        if (slotIndex_toRemove > -1) {
          timeSlots.splice(slotIndex_toRemove, 1);
        }

        break;
      }

      if (!assigned) {
        // If we couldn't assign in this iteration, try to resolve conflicts
        this.conflicts.push({
          subject: subject.name,
          classData: classData.name,
          hoursAssigned,
          hoursRequired: subject.hoursPerWeek,
          reason: 'Could not find suitable time slot'
        });
        break;
      }
    }

    if (hoursAssigned < subject.hoursPerWeek) {
      console.warn(`Could only assign ${hoursAssigned}/${subject.hoursPerWeek} hours for ${subject.name} in ${classData.name}`);
    }
  }

  getAppropriateRooms(subject, allRooms, classStrength) {
    let appropriateRooms = [];

    if (subject.type === 'Lab' || subject.type === 'Practical') {
      // For lab subjects, prefer laboratories
      appropriateRooms = allRooms.filter(room => 
        room.labId && room.capacity >= classStrength && room.isActive
      );
      
      // If no labs available, use classrooms as fallback
      if (appropriateRooms.length === 0) {
        appropriateRooms = allRooms.filter(room => 
          room.roomId && room.capacity >= classStrength && room.isActive
        );
      }
    } else {
      // For theory subjects, prefer classrooms
      appropriateRooms = allRooms.filter(room => 
        room.roomId && room.capacity >= classStrength && room.isActive
      );
      
      // If no classrooms available, use labs as fallback
      if (appropriateRooms.length === 0) {
        appropriateRooms = allRooms.filter(room => 
          room.labId && room.capacity >= classStrength && room.isActive
        );
      }
    }

    return appropriateRooms;
  }

  findAvailableFaculty(subjectFaculty, day, slotIndex, usedFaculty) {
    return subjectFaculty.find(faculty => 
      faculty.availableDays.includes(day) &&
      !usedFaculty.has(faculty.facultyId) &&
      !this.hasFacultyUnavailableSlot(faculty, day, slotIndex)
    );
  }

  findAvailableRoom(appropriateRooms, usedRooms) {
    return appropriateRooms.find(room => 
      !usedRooms.has(room.roomId || room.labId)
    );
  }

  isSlotOccupied(schedule, day, slotIndex) {
    return schedule.some(slot => slot.day === day && slot.slotIndex === slotIndex);
  }

  hasFacultyUnavailableSlot(faculty, day, slotIndex) {
    return faculty.unavailableSlots.some(unavailable => 
      unavailable.day === day && 
      this.timeSlotOverlaps(unavailable.timeSlot, slotIndex)
    );
  }

  timeSlotOverlaps(unavailableSlot, slotIndex) {
    // Simple implementation - could be enhanced to check actual time overlaps
    return false; // For now, assume no overlap unless specifically defined
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async optimizeTimetable(timetableId) {
    try {
      const timetable = await Timetable.findById(timetableId);
      if (!timetable) {
        throw new Error('Timetable not found');
      }

      // Find and resolve conflicts
      const conflicts = timetable.findConflicts();
      
      // Implement optimization logic here
      // For now, return the current timetable with conflict information
      
      return {
        success: true,
        data: timetable,
        conflicts,
        optimizationApplied: false,
        message: conflicts.length === 0 ? 'No conflicts found' : `${conflicts.length} conflicts detected`
      };

    } catch (error) {
      throw new Error(`Timetable optimization failed: ${error.message}`);
    }
  }

  async validateTimetable(timetableId) {
    try {
      const timetable = await Timetable.findById(timetableId)
        .populate('semester')
        .populate('class');

      if (!timetable) {
        throw new Error('Timetable not found');
      }

      const validationResults = {
        isValid: true,
        errors: [],
        warnings: [],
        statistics: {
          totalSlots: timetable.schedule.length,
          uniqueFaculty: new Set(timetable.schedule.map(s => s.faculty)).size,
          uniqueRooms: new Set(timetable.schedule.map(s => s.room)).size,
          uniqueSubjects: new Set(timetable.schedule.map(s => s.subject)).size
        }
      };

      // Check for conflicts
      const conflicts = timetable.findConflicts();
      if (conflicts.length > 0) {
        validationResults.isValid = false;
        validationResults.errors.push(...conflicts.map(c => c.details));
      }

      // Check for empty days
      const usedDays = new Set(timetable.schedule.map(s => s.day));
      const semesterDays = timetable.semester.workingDays;
      const unusedDays = semesterDays.filter(day => !usedDays.has(day));
      
      if (unusedDays.length > 0) {
        validationResults.warnings.push(`No classes scheduled for: ${unusedDays.join(', ')}`);
      }

      return validationResults;

    } catch (error) {
      throw new Error(`Timetable validation failed: ${error.message}`);
    }
  }
}

module.exports = TimetableGenerator;