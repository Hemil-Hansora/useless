const express = require('express');
const Faculty = require('../models/Faculty');
const { validateFaculty } = require('../middleware/validation');
const router = express.Router();

// GET /api/faculty - Get all faculty
router.get('/', async (req, res) => {
  try {
    const { isActive = true, department, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (department) filter.department = new RegExp(department, 'i');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
    };

    const faculty = await Faculty.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('subjects', 'name code type');

    const total = await Faculty.countDocuments(filter);

    res.json({
      success: true,
      data: faculty,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty data',
      message: error.message
    });
  }
});

// GET /api/faculty/:id - Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.params.id })
      .populate('subjects', 'name code type hoursPerWeek');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch faculty data',
      message: error.message
    });
  }
});

// POST /api/faculty - Create new faculty
router.post('/', validateFaculty, async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();

    res.status(201).json({
      success: true,
      data: faculty,
      message: 'Faculty created successfully'
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `Faculty ${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create faculty',
      message: error.message
    });
  }
});

// PUT /api/faculty/:id - Update faculty
router.put('/:id', validateFaculty, async (req, res) => {
  try {
    const faculty = await Faculty.findOneAndUpdate(
      { facultyId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('subjects', 'name code type');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: faculty,
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update faculty',
      message: error.message
    });
  }
});

// DELETE /api/faculty/:id - Delete faculty (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOneAndUpdate(
      { facultyId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty deactivated successfully'
    });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete faculty',
      message: error.message
    });
  }
});

// POST /api/faculty/:id/subjects - Add subjects to faculty
router.post('/:id/subjects', async (req, res) => {
  try {
    const { subjects } = req.body;
    
    const faculty = await Faculty.findOne({ facultyId: req.params.id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    // Add subjects that aren't already assigned
    const newSubjects = subjects.filter(subjectId => 
      !faculty.subjects.includes(subjectId)
    );
    
    faculty.subjects.push(...newSubjects);
    await faculty.save();

    res.json({
      success: true,
      data: faculty,
      message: 'Subjects added successfully'
    });
  } catch (error) {
    console.error('Add subjects error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to add subjects',
      message: error.message
    });
  }
});

// DELETE /api/faculty/:id/subjects/:subjectId - Remove subject from faculty
router.delete('/:id/subjects/:subjectId', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.params.id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    faculty.subjects = faculty.subjects.filter(
      subjectId => subjectId !== req.params.subjectId
    );
    await faculty.save();

    res.json({
      success: true,
      data: faculty,
      message: 'Subject removed successfully'
    });
  } catch (error) {
    console.error('Remove subject error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to remove subject',
      message: error.message
    });
  }
});

module.exports = router;