# CampusHive Faculty Review - First Time Setup Guide

This guide will walk you through setting up the Faculty Review feature from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js installed (v16 or higher) - [Download](https://nodejs.org/)
- [ ] MongoDB installed locally OR MongoDB Atlas account
- [ ] Git (if cloning from repository)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

## Step 1: Install MongoDB

### Option A: Local MongoDB Installation

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your operating system
   - Download and install

2. **Start MongoDB Service**
   - **Windows**: MongoDB usually runs as a service automatically
   - **Mac/Linux**: Run `mongod` in terminal
   - Verify it's running on default port 27017

### Option B: MongoDB Atlas (Cloud - Recommended for Beginners)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to you

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## Step 2: Clone/Download Project

If you have the project files, navigate to the project directory:
```bash
cd "F:\BRAC CLASSES\10th Sem\CSE470\Project\p2"
```

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory
```bash
cd backend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- express
- mongoose
- dotenv
- cors
- csv-parser
- nodemon (dev dependency)

### 3.3 Create Environment File

Create a file named `.env` in the `backend` folder:

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campushive
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campushive?retryWrites=true&w=majority
NODE_ENV=development
```

Replace `username`, `password`, and `cluster` with your Atlas credentials.

### 3.4 Verify Image Directory Structure

Ensure the following directory exists:
```
backend/
└── public/
    └── uploads/
        └── avatars/
            ├── placeholder-teacher.png
            └── [teacher images from CSV]
```

### 3.5 Import Teachers from CSV

Run the import script to load faculty data:
```bash
npm run import-teachers
```

**What this does:**
- Reads `teachers.csv` from project root
- Parses teacher information (name, designation, email, image path)
- Validates image files exist
- Creates Teacher documents in MongoDB
- Shows import summary with counts

**Expected Output:**
```
Parsed 256 rows from CSV
Valid teachers found: 250
Skipped: 5, Errors: 1

✓ Imported: Dr. Mohammad Kaykobad [KYK]
✓ Imported: Md. Saiful Islam [MSI]
...

=== Import Summary ===
Total rows processed: 256
Successfully imported: 250
Skipped: 5
Errors: 1
=====================
```

### 3.6 Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
MongoDB Connected: localhost:27017
Server running on port 5000
```

**Keep this terminal window open!**

## Step 4: Frontend Setup

### 4.1 Open New Terminal Window

Keep the backend running, open a **new terminal window**.

### 4.2 Navigate to Frontend Directory
```bash
cd frontend
```

### 4.3 Install Dependencies
```bash
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- axios
- vite
- @vitejs/plugin-react

### 4.4 Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Keep this terminal window open too!**

## Step 5: Verify Installation

### 5.1 Check Backend Health

Open browser and visit: http://localhost:5000/api/health

**Expected Response:**
```json
{
  "message": "CampusHive API is running"
}
```

### 5.2 Check Teachers API

Visit: http://localhost:5000/api/teachers

**Expected Response:**
```json
{
  "teachers": [
    {
      "_id": "...",
      "teacherId": "MSI",
      "name": "Md. Saiful Islam [MSI]",
      "designation": "Senior Lecturer",
      "email": "md.saiful.islam@bracu.ac.bd",
      "imagePath": "uploads/avatars/...",
      "averageRating": 0,
      "totalReviews": 0
    },
    ...
  ],
  "pagination": { ... }
}
```

### 5.3 Check Frontend

Open browser and visit: http://localhost:3000

**You should see:**
- Header with "CampusHive - Faculty Review"
- Grid of teacher cards with images
- Search bar
- "View All Reviews" link

## Step 6: Test the Application

### 6.1 View Teachers
1. Go to http://localhost:3000
2. You should see all faculty members in a grid
3. Click on any teacher card

### 6.2 View Teacher Details
1. On teacher detail page, you should see:
   - Teacher profile picture
   - Name, designation, email
   - Average rating (0 if no reviews)
   - "Write a Review" button

### 6.3 Create a Review
1. Click "Write a Review" button
2. Fill in:
   - Course: e.g., "CSE470"
   - Term: e.g., "Fall 2024"
   - Rating: Click stars (1-5)
   - Review: Write some text
3. Click "Submit Review"
4. Review should appear in the list

### 6.4 Test Flagging
1. Find a review
2. Click "+ Helpful" or "- Not Helpful" button
3. Counts should update at the bottom
4. Button should show active state

## Troubleshooting

### Problem: MongoDB Connection Error

**Error:** `MongoDB connection error` or `ECONNREFUSED`

**Solutions:**
1. **Local MongoDB:**
   - Check if MongoDB service is running
   - Windows: Check Services app for "MongoDB"
   - Mac/Linux: Run `mongod` in terminal
   
2. **MongoDB Atlas:**
   - Verify connection string in `.env` is correct
   - Check network access in Atlas (allow your IP)
   - Verify username/password are correct

### Problem: Port Already in Use

**Error:** `Port 5000 is already in use` or `Port 3000 is already in use`

**Solutions:**
1. Find and stop the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

2. Or change the port in `.env`:
   ```env
   PORT=5001
   ```
   Then update `vite.config.js` proxy target if needed.

### Problem: Images Not Loading

**Symptoms:** All teacher images show placeholder

**Solutions:**
1. Verify images exist in `backend/public/uploads/avatars/`
2. Check CSV image paths match actual filenames
3. Verify backend is serving static files:
   - Visit: http://localhost:5000/uploads/avatars/placeholder-teacher.png
   - Should show the image
4. Check browser console for 404 errors
5. Verify Vite proxy is configured in `vite.config.js`

### Problem: CSV Import Fails

**Error:** `CSV file not found` or import errors

**Solutions:**
1. Ensure `teachers.csv` is in project root (not in backend folder)
2. Check CSV format matches expected structure:
   - Headers: `Name,Designation,Email,Image Path`
3. Verify image paths in CSV are correct
4. Check MongoDB is running before importing

### Problem: Cannot Create Review

**Error:** `Teacher not found` or validation errors

**Solutions:**
1. Ensure teachers were imported successfully
2. Check teacher ID in the URL matches database
3. Verify all form fields are filled
4. Check browser console for detailed error messages

### Problem: Flagging Doesn't Work

**Error:** `Cast to ObjectId failed` or flag not saving

**Solutions:**
1. Ensure placeholder user exists (created automatically on first review)
2. Check backend logs for detailed error
3. Verify `userId` is being sent from frontend
4. Restart backend server after code changes

## Development Workflow

### Starting the Project Daily

1. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Making Changes

- **Backend changes**: Server auto-restarts with nodemon
- **Frontend changes**: Vite hot-reloads automatically
- **Database changes**: Restart backend to reconnect

### Stopping the Project

- Press `Ctrl+C` in both terminal windows
- MongoDB will keep running (if local service)

## Next Steps After Setup

1. ✅ Verify all features work
2. ✅ Test creating reviews
3. ✅ Test flagging system
4. ✅ Check image loading
5. ✅ Test filtering and search
6. ✅ Review the code structure
7. 🔄 Integrate with full CampusHive platform (when ready)

## Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Install backend deps | `npm install` | `backend/` |
| Install frontend deps | `npm install` | `frontend/` |
| Import teachers | `npm run import-teachers` | `backend/` |
| Start backend | `npm run dev` | `backend/` |
| Start frontend | `npm run dev` | `frontend/` |
| Backend URL | http://localhost:5000 | - |
| Frontend URL | http://localhost:3000 | - |

## Getting Help

If you encounter issues:

1. Check browser console (F12) for frontend errors
2. Check backend terminal for server errors
3. Verify MongoDB is running and accessible
4. Check `.env` file configuration
5. Review error messages carefully
6. Ensure all dependencies are installed

## Success Indicators

You've successfully set up the project when:

- ✅ Backend server starts without errors
- ✅ Frontend loads at http://localhost:3000
- ✅ Teacher list displays with images
- ✅ Can view teacher details
- ✅ Can create reviews
- ✅ Can flag reviews
- ✅ Images load correctly
- ✅ No console errors in browser

