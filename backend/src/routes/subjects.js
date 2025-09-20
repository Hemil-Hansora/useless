const express = require('express');
const Subject = require('../models/Subject');
const { validateSubject } = require('../middleware/validation');
const router = express.Router();

// GET /api/subjects - Get all subjects
router.get('/', async (req, res) => {
  try {
    const { 
      isActive = true, 
      semester, 
      type, 
      department,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (semester) filter.semester = parseInt(semester);
    if (type) filter.type = type;
    if (department) filter.department = new RegExp(department, 'i');

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { semester: 1, name: 1 }
    };

    const subjects = await Subject.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('prerequisites', 'name code');

    const total = await Subject.countDocuments(filter);

    res.json({
      success: true,
      data: subjects,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects data',
      message: error.message
    });
  }
});

// GET /api/subjects/:id - Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({ subjectId: req.params.id })
      .populate('prerequisites', 'name code semester');

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subject data',
      message: error.message
    });
  }
});

// POST /api/subjects - Create new subject
router.post('/', validateSubject, async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Create subject error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `Subject ${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      error: 'Failed to create subject',
      message: error.message
    });
  }
});

// PUT /api/subjects/:id - Update subject
router.put('/:id', validateSubject, async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { subjectId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('prerequisites', 'name code');

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update subject',
      message: error.message
    });
  }
});

// DELETE /api/subjects/:id - Delete subject (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { subjectId: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      message: 'Subject deactivated successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subject',
      message: error.message
    });
  }
});

// GET /api/subjects/semester/:semesterNum - Get subjects by semester
router.get('/semester/:semesterNum', async (req, res) => {
  try {
    const semesterNum = parseInt(req.params.semesterNum);
    const subjects = await Subject.find({ 
      semester: semesterNum, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects by semester error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects by semester',
      message: error.message
    });
  }
});

// GET /api/subjects/type/:type - Get subjects by type
router.get('/type/:type', async (req, res) => {
  try {
    const subjects = await Subject.find({ 
      type: req.params.type, 
      isActive: true 
    }).sort({ semester: 1, name: 1 });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects by type error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects by type',
      message: error.message
    });
  }
});

module.exports = router;