# CampusHive - Faculty Review Feature

A MERN stack web application for managing faculty reviews at BRAC University. This module allows students to view faculty members, write reviews about their teaching experiences, and interact with reviews through a positive/negative flagging system.

## Overview

This is a standalone feature module of the CampusHive platform that implements a complete faculty review system following the MVC (Model-View-Controller) architecture pattern. The system enables students to:

- Browse all faculty members with their profile information
- Write detailed reviews about courses and teachers
- View and filter reviews by various criteria
- Rate reviews as helpful or not helpful
- See aggregated ratings and statistics

## Features

### 1. Faculty Directory
- **Teacher List View**: Grid display of all faculty members with profile pictures
- **Teacher Detail View**: Individual teacher profiles with:
  - Profile information (name, designation, email)
  - Average rating and total review count
  - Rating distribution breakdown (1-5 stars)
  - All reviews for that teacher
- **Search Functionality**: Search teachers by name, designation, or email

### 2. Review Management
- **Create Reviews**: Submit reviews with:
  - Course name (e.g., CSE470)
  - Term (e.g., Fall 2024)
  - Star rating (1-5)
  - Written feedback
- **View Reviews**: Browse all reviews with:
  - Pagination support
  - Filtering by teacher, course, or term
  - Sort by date (newest first)
- **Review Display**: Each review shows:
  - Reviewer name and date
  - Course and term information
  - Star rating visualization
  - Review text content
  - Helpful/Not Helpful flag counts

### 3. Review Flagging System
- **Positive Flags (+ Helpful)**: Users can mark reviews as helpful
- **Negative Flags (- Not Helpful)**: Users can mark reviews as not helpful
- **One Flag Per User**: Each user can only flag a review once (can change their flag type)
- **Flag Counts**: Display total helpful and not helpful counts for each review
- **Visual Feedback**: Active flag state shown with color-coded buttons

### 4. Rating Analytics
- **Average Ratings**: Calculate and display average ratings per teacher
- **Rating Distribution**: Show breakdown of ratings (how many 5-star, 4-star, etc.)
- **Course Ratings**: Get average ratings for specific courses
- **Statistics**: Total review counts and aggregated data

## Project Architecture

### MVC Pattern Implementation

The project strictly follows the MVC (Model-View-Controller) architecture:

#### Backend (Node.js/Express)
```
backend/
├── models/          # Data Models (M in MVC)
│   ├── Teacher.js   # Faculty member schema
│   ├── Review.js    # Review schema with flagging
│   └── User.js      # User schema (placeholder)
├── controllers/     # Business Logic (C in MVC)
│   ├── teacherController.js  # Teacher operations
│   └── reviewController.js    # Review operations
├── routes/          # API Routes (Routing layer)
│   ├── teacherRoutes.js
│   └── reviewRoutes.js
├── middleware/      # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── config/          # Configuration
│   └── database.js   # MongoDB connection
└── scripts/          # Utility scripts
    └── importTeachers.js  # CSV import script
```

#### Frontend (React)
```
frontend/src/
├── components/      # UI Components (V in MVC)
│   └── faculty-review/
│       ├── TeacherList.jsx      # Faculty grid view
│       ├── TeacherDetail.jsx    # Teacher profile page
│       ├── ReviewList.jsx        # All reviews page
│       ├── ReviewCard.jsx        # Individual review card
│       ├── ReviewForm.jsx        # Review submission form
│       ├── FilterBar.jsx         # Review filtering
│       └── RatingDisplay.jsx     # Star rating component
├── services/        # API Communication Layer
│   ├── teacherService.js
│   └── reviewService.js
└── utils/           # Utility functions
    └── imageUtils.js
```

## Data Models

### Teacher Model
- `teacherId`: Unique identifier (e.g., "MSI")
- `name`: Full name
- `designation`: Job title (Professor, Lecturer, etc.)
- `email`: Email address
- `imagePath`: Path to profile picture (stored in `backend/public/uploads/avatars/`)

### Review Model
- `reviewId`: Unique review identifier
- `reviewer`: Reference to User (ObjectId)
- `teacher`: Reference to Teacher (ObjectId)
- `course`: Course code/name
- `term`: Academic term
- `rating`: 1-5 star rating
- `textContent`: Review text
- `positiveFlags`: Count of helpful flags
- `negativeFlags`: Count of not helpful flags
- `userFlags`: Array tracking which users flagged (one per user)
- `createdAt`: Timestamp

### User Model (Placeholder)
- `userId`: Unique identifier (currently "placeholder")
- `name`: User name
- `email`: User email

**Note**: The User model is a placeholder until the full authentication system is implemented.

## API Endpoints

### Teacher Endpoints
- `GET /api/teachers` - Get all teachers (with optional search, pagination)
- `GET /api/teachers/:teacherId` - Get teacher details with rating statistics
- `GET /api/teachers/:teacherId/reviews` - Get all reviews for a teacher

### Review Endpoints
- `POST /api/reviews` - Create a new review
  - Body: `{ teacher, course, term, rating, textContent }`
- `GET /api/reviews` - Get reviews with optional filters
  - Query params: `teacher`, `course`, `term`, `page`, `limit`
- `GET /api/reviews/:reviewId` - Get single review by ID
- `POST /api/reviews/:reviewId/flag` - Flag a review (positive/negative)
  - Body: `{ flagType: 'positive' | 'negative', userId }`

## How It Works

### Review Creation Flow
1. User fills out review form on teacher detail page
2. Frontend sends POST request to `/api/reviews`
3. Backend creates placeholder user if needed
4. Review is saved with placeholder user as reviewer
5. Review appears in teacher's review list

### Flagging Flow
1. User clicks + (Helpful) or - (Not Helpful) button
2. Frontend sends POST to `/api/reviews/:reviewId/flag` with `flagType` and `userId`
3. Backend converts `userId` string to ObjectId:
   - If `userId` is "placeholder", finds/creates placeholder user
   - If `userId` is ObjectId string, uses it directly
4. Backend checks if user already flagged:
   - If new: Adds flag and increments count
   - If existing: Updates flag type (switches between positive/negative)
5. Returns updated flag counts
6. Frontend updates UI to show user's flag status

### Image Serving
- Images stored in `backend/public/uploads/avatars/`
- Backend serves static files via `/uploads` route
- Frontend proxies `/uploads` requests to backend
- Missing images fallback to `placeholder-teacher.png`

## Technologies Used

- **Backend**:
  - Node.js with Express.js
  - MongoDB with Mongoose ODM
  - CSV parsing for data import
  - RESTful API design

- **Frontend**:
  - React 18 with functional components and hooks
  - React Router for navigation
  - Axios for HTTP requests
  - Vite as build tool

- **Styling**: CSS3 with responsive design

## Key Implementation Details

### Placeholder User System
- A placeholder user is automatically created when the first review is submitted
- Used for testing before full authentication is implemented
- Can be replaced with actual user authentication later
- Supports flagging functionality with userId conversion

### Image Handling
- Teacher images imported from CSV
- Images stored in `backend/public/uploads/avatars/`
- Paths normalized (Windows backslashes converted to forward slashes)
- Placeholder image used when image file is missing

### Flagging System
- One flag per user per review
- Users can change their flag type (positive ↔ negative)
- Flag counts displayed with color-coded badges
- Active flag state shown on buttons

## Future Enhancements

- Replace placeholder user with full authentication system
- Add user profiles and review history
- Implement review editing and deletion
- Add moderation tools for flagged reviews
- Include more filtering and sorting options
- Add export functionality for reviews

## Notes

- This is a standalone feature module that can be integrated into the larger CampusHive platform
- The User model is minimal and will be expanded when authentication is added
- All reviews currently use the placeholder user as the reviewer
- Image paths are relative and should be adjusted for production deployment

