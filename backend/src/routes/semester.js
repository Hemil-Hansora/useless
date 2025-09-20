const express = require('express');
const Semester = require('../models/Semester');
const { validateSemester } = require('../middleware/validation');
const router = express.Router();

// GET /api/semester - Get all semesters
router.get('/', async (req, res) => {
  try {
    const { isActive = true, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { startDate: -1 } // Most recent first
    };

    const semesters = await Semester.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Semester.countDocuments(filter);

    res.json({
      success: true,
      data: semesters,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch semesters data',
      message: error.message
    });
  }
});

// GET /api/semester/current - Get current active semester
router.get('/current', async (req, res) => {
  try {
    const semester = await Semester.findOne({ isCurrent: true, isActive: true });

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'No current semester found'
      });
    }

    res.json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error('Get current semester error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current semester',
      message: error.message
    });
  }
});

// GET /api/semester/:id - Get semester by ID
router.get('/:id', async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    res.json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error('Get semester by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch semester data',
      message: error.message
    });
  }
});

// POST /api/semester - Create new semester
router.post('/', validateSemester, async (req, res) => {
  try {
    const semester = new Semester(req.body);
    await semester.save();

    res.status(201).json({
      success: true,
      data: semester,
      message: 'Semester created successfully'
    });
  } catch (error) {
    console.error('Create semester error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create semester',
      message: error.message
    });
  }
});

// PUT /api/semester/:id - Update semester
router.put('/:id', validateSemester, async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    res.json({
      success: true,
      data: semester,
      message: 'Semester updated successfully'
    });
  } catch (error) {
    console.error('Update semester error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update semester',
      message: error.message
    });
  }
});

// DELETE /api/semester/:id - Delete semester (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    res.json({
      success: true,
      message: 'Semester deactivated successfully'
    });
  } catch (error) {
    console.error('Delete semester error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete semester',
      message: error.message
    });
  }
});

// PUT /api/semester/:id/set-current - Set semester as current
router.put('/:id/set-current', async (req, res) => {
  try {
    // First, unset all other semesters as current
    await Semester.updateMany({}, { isCurrent: false });

    // Set the specified semester as current
    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { isCurrent: true, isActive: true },
      { new: true }
    );

    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    res.json({
      success: true,
      data: semester,
      message: 'Semester set as current successfully'
    });
  } catch (error) {
    console.error('Set current semester error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set current semester',
      message: error.message
    });
  }
});

// POST /api/semester/:id/holidays - Add holiday to semester
router.post('/:id/holidays', async (req, res) => {
  try {
    const { date, name, description } = req.body;
    
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    semester.holidays.push({ date, name, description });
    await semester.save();

    res.json({
      success: true,
      data: semester,
      message: 'Holiday added successfully'
    });
  } catch (error) {
    console.error('Add holiday error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to add holiday',
      message: error.message
    });
  }
});

// DELETE /api/semester/:id/holidays/:holidayId - Remove holiday
router.delete('/:id/holidays/:holidayId', async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        error: 'Semester not found'
      });
    }

    semester.holidays = semester.holidays.filter(
      holiday => holiday._id.toString() !== req.params.holidayId
    );
    await semester.save();

    res.json({
      success: true,
      data: semester,
      message: 'Holiday removed successfully'
    });
  } catch (error) {
    console.error('Remove holiday error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to remove holiday',
      message: error.message
    });
  }
});

module.exports = router;