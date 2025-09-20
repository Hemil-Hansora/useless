const express = require('express');
const Timetable = require('../models/Timetable');
const TimetableGenerator = require('../services/timetableGenerator');
const { Class } = require('../models/Resource');
const router = express.Router();

// GET /api/timetable - Get all timetables
router.get('/', async (req, res) => {
  try {
    const { 
      semester, 
      class: classId, 
      status = 'Published',
      isActive = true,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};
    if (semester) filter.semester = semester;
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const timetables = await Timetable.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('semester', 'semesterName academicYear')
      .populate('class', 'name batch semester');

    const total = await Timetable.countDocuments(filter);

    res.json({
      success: true,
      data: timetables,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get timetables error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timetables',
      message: error.message
    });
  }
});

// GET /api/timetable/:id - Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('semester', 'semesterName academicYear workingDays timeSlots')
      .populate('class', 'name batch semester strength');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get timetable by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timetable',
      message: error.message
    });
  }
});

// POST /api/timetable/generate - Generate new timetable
router.post('/generate', async (req, res) => {
  try {
    const {
      semesterId,
      classIds,
      maxIterations = 1000,
      prioritizeTheory = true,
      saveAsDraft = true
    } = req.body;

    if (!semesterId || !classIds || classIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Semester ID and class IDs are required'
      });
    }

    // Validate classes exist
    const validClasses = await Class.find({ 
      classId: { $in: classIds }, 
      isActive: true 
    });

    if (validClasses.length !== classIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some class IDs are invalid or inactive'
      });
    }

    const generator = new TimetableGenerator();
    const result = await generator.generateTimetable({
      semesterId,
      classIds,
      maxIterations,
      prioritizeTheory
    });

    // Update status if not saving as draft
    if (!saveAsDraft && result.success) {
      await Timetable.updateMany(
        { _id: { $in: result.data.map(t => t._id) } },
        { status: 'Published' }
      );
    }

    res.status(201).json({
      success: true,
      data: result.data,
      metadata: result.metadata,
      message: `Successfully generated ${result.data.length} timetable(s)`
    });

  } catch (error) {
    console.error('Generate timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate timetable',
      message: error.message
    });
  }
});

// PUT /api/timetable/:id/publish - Publish timetable
router.put('/:id/publish', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Published',
        version: { $inc: 1 }
      },
      { new: true }
    ).populate('semester', 'semesterName academicYear')
     .populate('class', 'name batch');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      data: timetable,
      message: 'Timetable published successfully'
    });
  } catch (error) {
    console.error('Publish timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish timetable',
      message: error.message
    });
  }
});

// PUT /api/timetable/:id/archive - Archive timetable
router.put('/:id/archive', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { status: 'Archived' },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      message: 'Timetable archived successfully'
    });
  } catch (error) {
    console.error('Archive timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive timetable',
      message: error.message
    });
  }
});

// DELETE /api/timetable/:id - Delete timetable (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete timetable',
      message: error.message
    });
  }
});

// GET /api/timetable/:id/conflicts - Get timetable conflicts
router.get('/:id/conflicts', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    const conflicts = timetable.findConflicts();

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflictCount: conflicts.length,
        conflicts
      }
    });
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check conflicts',
      message: error.message
    });
  }
});

// POST /api/timetable/:id/optimize - Optimize timetable
router.post('/:id/optimize', async (req, res) => {
  try {
    const generator = new TimetableGenerator();
    const result = await generator.optimizeTimetable(req.params.id);

    res.json({
      success: result.success,
      data: result.data,
      conflicts: result.conflicts,
      message: result.message
    });
  } catch (error) {
    console.error('Optimize timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize timetable',
      message: error.message
    });
  }
});

// GET /api/timetable/:id/validate - Validate timetable
router.get('/:id/validate', async (req, res) => {
  try {
    const generator = new TimetableGenerator();
    const validation = await generator.validateTimetable(req.params.id);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Validate timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate timetable',
      message: error.message
    });
  }
});

// GET /api/timetable/class/:classId/current - Get current timetable for class
router.get('/class/:classId/current', async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      class: req.params.classId,
      status: 'Published',
      isActive: true
    })
    .populate('semester', 'semesterName academicYear workingDays timeSlots')
    .populate('class', 'name batch semester strength')
    .sort({ createdAt: -1 });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'No published timetable found for this class'
      });
    }

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get current class timetable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class timetable',
      message: error.message
    });
  }
});

// GET /api/timetable/faculty/:facultyId/schedule - Get faculty schedule
router.get('/faculty/:facultyId/schedule', async (req, res) => {
  try {
    const { semesterId } = req.query;
    
    const filter = {
      'schedule.faculty': req.params.facultyId,
      status: 'Published',
      isActive: true
    };
    
    if (semesterId) {
      filter.semester = semesterId;
    }

    const timetables = await Timetable.find(filter)
      .populate('semester', 'semesterName academicYear workingDays timeSlots')
      .populate('class', 'name batch semester');

    // Combine all schedules for this faculty
    const facultySchedule = [];
    timetables.forEach(timetable => {
      const facultySlots = timetable.schedule.filter(
        slot => slot.faculty === req.params.facultyId
      );
      facultySlots.forEach(slot => {
        facultySchedule.push({
          ...slot.toObject(),
          className: timetable.class.name,
          semester: timetable.semester
        });
      });
    });

    res.json({
      success: true,
      data: {
        facultyId: req.params.facultyId,
        schedule: facultySchedule,
        totalHours: facultySchedule.length
      }
    });
  } catch (error) {
    console.error('Get faculty schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty schedule',
      message: error.message
    });
  }
});

// GET /api/timetable/room/:roomId/usage - Get room usage
router.get('/room/:roomId/usage', async (req, res) => {
  try {
    const { semesterId } = req.query;
    
    const filter = {
      'schedule.room': req.params.roomId,
      status: 'Published',
      isActive: true
    };
    
    if (semesterId) {
      filter.semester = semesterId;
    }

    const timetables = await Timetable.find(filter)
      .populate('semester', 'semesterName academicYear workingDays timeSlots')
      .populate('class', 'name batch semester');

    // Combine all room usage
    const roomUsage = [];
    timetables.forEach(timetable => {
      const roomSlots = timetable.schedule.filter(
        slot => slot.room === req.params.roomId
      );
      roomSlots.forEach(slot => {
        roomUsage.push({
          ...slot.toObject(),
          className: timetable.class.name,
          semester: timetable.semester
        });
      });
    });

    res.json({
      success: true,
      data: {
        roomId: req.params.roomId,
        usage: roomUsage,
        totalHours: roomUsage.length
      }
    });
  } catch (error) {
    console.error('Get room usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room usage',
      message: error.message
    });
  }
});

module.exports = router;