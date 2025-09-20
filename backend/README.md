# Academic Scheduling Pro - Backend

A comprehensive Node.js/Express backend API for academic timetable generation and management.

## Features

- **Faculty Management**: CRUD operations for faculty with subject assignments and availability
- **Subject Management**: Handle subjects with credits, hours, and prerequisites
- **Semester Configuration**: Manage academic semesters with working days and time slots
- **Resource Management**: Classrooms, laboratories, and class/batch management
- **Intelligent Timetable Generation**: Automated scheduling with conflict resolution
- **Validation & Optimization**: Comprehensive validation and optimization algorithms

## API Endpoints

### Faculty (`/api/faculty`)
- `GET /` - Get all faculty (with pagination and filters)
- `GET /:id` - Get faculty by ID
- `POST /` - Create new faculty
- `PUT /:id` - Update faculty
- `DELETE /:id` - Soft delete faculty
- `POST /:id/subjects` - Add subjects to faculty
- `DELETE /:id/subjects/:subjectId` - Remove subject from faculty

### Subjects (`/api/subjects`)
- `GET /` - Get all subjects
- `GET /:id` - Get subject by ID
- `POST /` - Create new subject
- `PUT /:id` - Update subject
- `DELETE /:id` - Soft delete subject
- `GET /semester/:semesterNum` - Get subjects by semester
- `GET /type/:type` - Get subjects by type

### Semester (`/api/semester`)
- `GET /` - Get all semesters
- `GET /current` - Get current active semester
- `GET /:id` - Get semester by ID
- `POST /` - Create new semester
- `PUT /:id` - Update semester
- `DELETE /:id` - Soft delete semester
- `PUT /:id/set-current` - Set as current semester
- `POST /:id/holidays` - Add holiday
- `DELETE /:id/holidays/:holidayId` - Remove holiday

### Resources (`/api/resources`)
#### Classrooms
- `GET /classrooms` - Get all classrooms
- `POST /classrooms` - Create classroom
- `PUT /classrooms/:id` - Update classroom
- `DELETE /classrooms/:id` - Delete classroom

#### Laboratories
- `GET /laboratories` - Get all laboratories
- `POST /laboratories` - Create laboratory
- `PUT /laboratories/:id` - Update laboratory
- `DELETE /laboratories/:id` - Delete laboratory

#### Classes
- `GET /classes` - Get all classes
- `POST /classes` - Create class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

### Timetable (`/api/timetable`)
- `GET /` - Get all timetables
- `GET /:id` - Get timetable by ID
- `POST /generate` - Generate new timetable
- `PUT /:id/publish` - Publish timetable
- `PUT /:id/archive` - Archive timetable
- `DELETE /:id` - Delete timetable
- `GET /:id/conflicts` - Get timetable conflicts
- `POST /:id/optimize` - Optimize timetable
- `GET /:id/validate` - Validate timetable
- `GET /class/:classId/current` - Get current class timetable
- `GET /faculty/:facultyId/schedule` - Get faculty schedule
- `GET /room/:roomId/usage` - Get room usage

## Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection and other settings
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/acad_sched_pro
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

## Database Schema

### Collections:
- **faculties**: Faculty information and availability
- **subjects**: Subject details with credits and requirements
- **semesters**: Academic semester configuration
- **classrooms**: Classroom resources
- **laboratories**: Laboratory resources
- **classes**: Student class/batch information
- **timetables**: Generated timetables with schedules

## Timetable Generation Algorithm

The system uses an intelligent algorithm that:

1. **Analyzes Constraints**: Faculty availability, room capacity, subject requirements
2. **Prioritizes Assignments**: Theory subjects first, then labs and practicals
3. **Resolves Conflicts**: Automatic conflict detection and resolution
4. **Optimizes Distribution**: Even distribution across days and time slots
5. **Validates Results**: Comprehensive validation of generated timetables

## Key Features

- **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- **Resource Optimization**: Efficient allocation of rooms and faculty
- **Flexible Constraints**: Support for faculty unavailability and room preferences
- **Validation System**: Multi-level validation for data integrity
- **Soft Deletion**: Safe deletion with recovery capabilities
- **Pagination**: Efficient data loading with pagination support

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Optional message",
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  },
  "error": "Error message if success is false"
}
```

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Not found errors (404)
- Server errors (500)
- Duplicate resource errors (400)

## Dependencies

- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **Joi**: Input validation
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Morgan**: Request logging
- **Compression**: Response compression

## Testing

```bash
npm test
```

## License

ISC License