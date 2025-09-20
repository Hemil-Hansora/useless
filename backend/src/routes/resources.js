const express = require('express');
const { Classroom, Laboratory, Class } = require('../models/Resource');
const { validateResource } = require('../middleware/validation');
const router = express.Router();

// ============ CLASSROOMS ============

// GET /api/resources/classrooms - Get all classrooms
router.get('/classrooms', async (req, res) => {
  try {
    const { isActive = true, type, building, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;
    if (building) filter.building = new RegExp(building, 'i');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
    };

    const classrooms = await Classroom.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Classroom.countDocuments(filter);

    res.json({
      success: true,
      data: classrooms,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classrooms data',
      message: error.message
    });
  }
});

// GET /api/resources/classrooms/:id - Get classroom by ID
router.get('/classrooms/:id', async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ roomId: req.params.id });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found'
      });
    }

    res.json({
      success: true,
      data: classroom
    });
  } catch (error) {
    console.error('Get classroom by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classroom data',
      message: error.message
    });
  }
});

// POST /api/resources/classrooms - Create new classroom
router.post('/classrooms', validateResource('classroom'), async (req, res) => {
  try {
    const classroom = new Classroom(req.body);
    await classroom.save();

    res.status(201).json({
      success: true,
      data: classroom,
      message: 'Classroom created successfully'
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Classroom ID already exists'
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create classroom',
      message: error.message
    });
  }
});

// PUT /api/resources/classrooms/:id - Update classroom
router.put('/classrooms/:id', validateResource('classroom'), async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { roomId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found'
      });
    }

    res.json({
      success: true,
      data: classroom,
      message: 'Classroom updated successfully'
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update classroom',
      message: error.message
    });
  }
});

// DELETE /api/resources/classrooms/:id - Delete classroom (soft delete)
router.delete('/classrooms/:id', async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { roomId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found'
      });
    }

    res.json({
      success: true,
      message: 'Classroom deactivated successfully'
    });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete classroom',
      message: error.message
    });
  }
});

// ============ LABORATORIES ============

// GET /api/resources/laboratories - Get all laboratories
router.get('/laboratories', async (req, res) => {
  try {
    const { isActive = true, type, building, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;
    if (building) filter.building = new RegExp(building, 'i');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
    };

    const laboratories = await Laboratory.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Laboratory.countDocuments(filter);

    res.json({
      success: true,
      data: laboratories,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get laboratories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch laboratories data',
      message: error.message
    });
  }
});

// GET /api/resources/laboratories/:id - Get laboratory by ID
router.get('/laboratories/:id', async (req, res) => {
  try {
    const laboratory = await Laboratory.findOne({ labId: req.params.id });

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        error: 'Laboratory not found'
      });
    }

    res.json({
      success: true,
      data: laboratory
    });
  } catch (error) {
    console.error('Get laboratory by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch laboratory data',
      message: error.message
    });
  }
});

// POST /api/resources/laboratories - Create new laboratory
router.post('/laboratories', validateResource('laboratory'), async (req, res) => {
  try {
    const laboratory = new Laboratory(req.body);
    await laboratory.save();

    res.status(201).json({
      success: true,
      data: laboratory,
      message: 'Laboratory created successfully'
    });
  } catch (error) {
    console.error('Create laboratory error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Laboratory ID already exists'
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create laboratory',
      message: error.message
    });
  }
});

// PUT /api/resources/laboratories/:id - Update laboratory
router.put('/laboratories/:id', validateResource('laboratory'), async (req, res) => {
  try {
    const laboratory = await Laboratory.findOneAndUpdate(
      { labId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        error: 'Laboratory not found'
      });
    }

    res.json({
      success: true,
      data: laboratory,
      message: 'Laboratory updated successfully'
    });
  } catch (error) {
    console.error('Update laboratory error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update laboratory',
      message: error.message
    });
  }
});

// DELETE /api/resources/laboratories/:id - Delete laboratory (soft delete)
router.delete('/laboratories/:id', async (req, res) => {
  try {
    const laboratory = await Laboratory.findOneAndUpdate(
      { labId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        error: 'Laboratory not found'
      });
    }

    res.json({
      success: true,
      message: 'Laboratory deactivated successfully'
    });
  } catch (error) {
    console.error('Delete laboratory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete laboratory',
      message: error.message
    });
  }
});

// ============ CLASSES ============

// GET /api/resources/classes - Get all classes
router.get('/classes', async (req, res) => {
  try {
    const { isActive = true, semester, department, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (semester) filter.semester = parseInt(semester);
    if (department) filter.department = new RegExp(department, 'i');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { semester: 1, name: 1 }
    };

    const classes = await Class.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('classTeacher', 'name email')
      .populate('subjects', 'name code type');

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: classes,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes data',
      message: error.message
    });
  }
});

// GET /api/resources/classes/:id - Get class by ID
router.get('/classes/:id', async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.id })
      .populate('classTeacher', 'name email')
      .populate('subjects', 'name code type hoursPerWeek');

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class data',
      message: error.message
    });
  }
});

// POST /api/resources/classes - Create new class
router.post('/classes', validateResource('class'), async (req, res) => {
  try {
    const classData = new Class(req.body);
    await classData.save();

    res.status(201).json({
      success: true,
      data: classData,
      message: 'Class created successfully'
    });
  } catch (error) {
    console.error('Create class error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Class ID already exists'
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create class',
      message: error.message
    });
  }
});

// PUT /api/resources/classes/:id - Update class
router.put('/classes/:id', validateResource('class'), async (req, res) => {
  try {
    const classData = await Class.findOneAndUpdate(
      { classId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('classTeacher', 'name email')
     .populate('subjects', 'name code type');

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update class',
      message: error.message
    });
  }
});

// DELETE /api/resources/classes/:id - Delete class (soft delete)
router.delete('/classes/:id', async (req, res) => {
  try {
    const classData = await Class.findOneAndUpdate(
      { classId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deactivated successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete class',
      message: error.message
    });
  }
});

// ============ COMBINED ENDPOINTS ============

// GET /api/resources/all - Get all resources summary
router.get('/all', async (req, res) => {
  try {
    const [classrooms, laboratories, classes] = await Promise.all([
      Classroom.find({ isActive: true }).select('roomId name capacity type'),
      Laboratory.find({ isActive: true }).select('labId name capacity type'),
      Class.find({ isActive: true }).select('classId name semester strength')
    ]);

    res.json({
      success: true,
      data: {
        classrooms,
        laboratories,
        classes,
        summary: {
          totalClassrooms: classrooms.length,
          totalLaboratories: laboratories.length,
          totalClasses: classes.length
        }
      }
    });
  } catch (error) {
    console.error('Get all resources error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources data',
      message: error.message
    });
  }
});

module.exports = router;