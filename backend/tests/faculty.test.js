const request = require('supertest');
const app = require('../src/index');
const { setupTestDB, teardownTestDB, cleanupTestDB } = require('./setup');

describe('Faculty API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
  });

  describe('POST /api/faculty', () => {
    it('should create a new faculty member', async () => {
      const facultyData = {
        facultyId: 'F001',
        name: 'Dr. John Doe',
        email: 'john.doe@university.edu',
        subjects: ['CS101'],
        maxHoursPerWeek: 20,
        availableDays: ['Monday', 'Tuesday', 'Wednesday'],
        department: 'Computer Science'
      };

      const response = await request(app)
        .post('/api/faculty')
        .send(facultyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(facultyData.name);
      expect(response.body.data.email).toBe(facultyData.email);
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        facultyId: '',
        name: 'Dr. John Doe'
        // Missing required email field
      };

      const response = await request(app)
        .post('/api/faculty')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/faculty', () => {
    beforeEach(async () => {
      // Create test faculty
      await request(app)
        .post('/api/faculty')
        .send({
          facultyId: 'F001',
          name: 'Dr. John Doe',
          email: 'john.doe@university.edu',
          subjects: ['CS101'],
          maxHoursPerWeek: 20
        });
    });

    it('should get all faculty members', async () => {
      const response = await request(app)
        .get('/api/faculty')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it('should filter faculty by department', async () => {
      const response = await request(app)
        .get('/api/faculty?department=Computer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/faculty/:id', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/faculty')
        .send({
          facultyId: 'F001',
          name: 'Dr. John Doe',
          email: 'john.doe@university.edu',
          subjects: ['CS101'],
          maxHoursPerWeek: 20
        });
    });

    it('should get faculty by ID', async () => {
      const response = await request(app)
        .get('/api/faculty/F001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.facultyId).toBe('F001');
    });

    it('should return 404 for non-existent faculty', async () => {
      const response = await request(app)
        .get('/api/faculty/F999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Faculty not found');
    });
  });
});