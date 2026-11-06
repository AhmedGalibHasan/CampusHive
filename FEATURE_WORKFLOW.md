# Feature Workflow Breakdown

This document describes end-to-end flows for the Faculty Review feature: how teachers are listed and searched, how an individual teacher page is loaded, how reviews are added and flagged, how review lists are returned, and how review search works. For each flow it maps the UI → frontend service → backend route → controller → DB and shows example requests and responses as well as the relevant files.

---

## 1) Listing All Teachers (with attributes & ratings)

- Flow:
  1. UI: `TeacherList.jsx` mounts and calls `teacherService.getAllTeachers({ search, page, limit })`.
  2. Service: GET `/api/teachers?search=...&page=...&limit=...`.
  3. Route: `teacherRoutes.js` → controller `getAllTeachers` (or `getTeachersWithRatings`).
  4. Controller: queries `Teacher` collection and computes `averageRating` and `totalReviews` (recommended: bulk aggregation to avoid N+1).
  5. DB: `Teacher.find()` + `Review.aggregate()` (optimized single aggregation recommended).
  6. Response: `{ teachers: [ { _id, teacherId, name, designation, email, imagePath, averageRating, totalReviews } ], pagination }`.

- Files involved:
  - Frontend: `frontend/src/components/faculty-review/TeacherList.jsx`
  - Frontend service: `frontend/src/services/teacherService.js` (`getAllTeachers` / `getTeachersWithRatings`)
  - Backend route: `backend/routes/teacherRoutes.js`
  - Backend controller: `backend/controllers/teacherController.js` (`getAllTeachers` / `getTeachersWithRatings`)
  - Models: `backend/models/Teacher.js`, `backend/models/Review.js`

- Example request:
  `GET /api/teachers?search=Islam&page=1&limit=12`

- Example response (trimmed):
```json
{
  "teachers": [
    {
      "_id": "507f1f77...",
      "teacherId": "MSI",
      "name": "Md. Saiful Islam",
      "designation": "Associate Professor",
      "imagePath": "/uploads/avatars/islam.jpg",
      "averageRating": 4.5,
      "totalReviews": 24
    }
  ],
  "pagination": { "page":1, "limit":12, "total":47, "pages":4 }
}
```

---

## 2) Searching Teachers (in list)

- How it works:
  - Frontend: user types search → `TeacherList` calls `teacherService.getAllTeachers({ search })`.
  - Backend: controller uses `$or` regex on `name`, `designation`, and `email`:
    ```js
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    ```
  - Response same as listing but filtered.

- Files: `TeacherList.jsx`, `teacherService.js`, `teacherController.js`.

---

## 3) Individual Teacher Detail (attributes + rating distribution)

- Flow:
  1. UI: `TeacherDetail.jsx` loads and calls `teacherService.getTeacherById(teacherId)`.
  2. Service: GET `/api/teachers/:teacherId`.
  3. Controller: `getTeacherById` resolves teacher record and aggregates reviews for that teacher to produce `averageRating`, `totalReviews`, and `ratingDistribution` (counts for 1..5).
  4. Response: teacher object with rating fields included.
  5. UI: displays profile and rating visuals (`RatingDisplay`, distribution bars).

- Files: `TeacherDetail.jsx`, `RatingDisplay.jsx`, `teacherService.js`, `teacherController.js`.

---

## 4) Add a Review to a Teacher

- Flow:
  1. UI: `ReviewForm.jsx` submission calls `reviewService.createReview(reviewData)`.
  2. Service: POST `/api/reviews` with body `{ teacher, course, term, rating, textContent }`.
  3. Route: `reviewRoutes.js` → controller `addReview`.
  4. Controller:
     - (recommended) validate input using `validateReview` middleware.
     - create `Review` document (set `reviewer`, `teacher` reference, `rating`, `textContent`, etc.).
  5. Response: created review object. UI refreshes review list or updates state.

- Files: `ReviewForm.jsx`, `reviewService.js`, `reviewRoutes.js`, `reviewController.addReview`, `backend/middleware/validation.js`.

---

## 5) Flagging Reviews (helpful / not helpful)

- Flow:
  1. UI: `ReviewCard.jsx` user clicks flag → `reviewService.flagReview(reviewId, flagType, userId)`.
  2. Service: POST `/api/reviews/:reviewId/flag` with `{ flagType, userId }`.
  3. Controller: `flagReview` validates review, records or toggles the user's flag in `userFlags` array, updates `positiveFlags` / `negativeFlags` counters, and returns updated counts.
  4. UI: updates button state and counts.

- Files: `ReviewCard.jsx`, `reviewService.js`, `reviewRoutes.js`, `reviewController.flagReview`, `backend/models/Review.js`.

---

## 6) Showing All Reviews (list & pagination)

- Flow:
  1. UI: `ReviewList.jsx` (or `TeacherDetail.jsx`) calls `reviewService.getReviews(filters)`.
  2. Service: GET `/api/reviews?teacher=<id>&course=<>&term=<>&page=&limit=`.
  3. Controller: `getReviews` builds filter query, populates `teacher` and `reviewer`, applies `skip/limit`, sorts by `createdAt` desc and returns paginated results.
  4. UI: maps reviews to `ReviewCard` components.

- Files: `ReviewList.jsx`, `reviewService.js`, `reviewController.getReviews`.

---

## 7) Searching Reviews by teacher / course / term

- How:
  - Frontend builds query params (`URLSearchParams`) and calls GET `/api/reviews` with any of: `teacher`, `course`, `term`, `page`, `limit`.
  - Backend constructs `query`:
    ```js
    if (teacher) query.teacher = teacher;
    if (course) query.course = { $regex: course, $options: 'i' };
    if (term) query.term = { $regex: term, $options: 'i' };
    ```
  - DB: `Review.find(query).populate(...).sort(...).skip(...).limit(...)`.
  - Response: paginated reviews matching provided filters.

- Files: `ReviewList.jsx`, `reviewService.js`, `reviewController.getReviews`, `reviewRoutes.js`.

---

## Cross-cutting notes & recommendations

- Validation: apply `validateReview` middleware to `POST /api/reviews`.
- Performance: fix N+1 in `teacherController.getAllTeachers` by using `getTeachersWithRatings` or by adding a `backend/utils/ratingCalculator.js` with helpers `calculateTeacherRating` and `calculateMultipleTeacherRatings`.
- Error handling: consolidate frontend service error handling into an `apiClient` (axios instance) to DRY repeated try/catch blocks.
- Testing: use browser DevTools Network tab to verify which endpoints UI requests.

---

## Quick curl examples

```bash
curl "http://localhost:5000/api/teachers?page=1&limit=12"
curl "http://localhost:5000/api/teachers/507f1f77..."
curl -X POST -H "Content-Type: application/json" -d '{"teacher":"507f1f77...","course":"CSE470","rating":5,"textContent":"Great"}' http://localhost:5000/api/reviews
```

---

## Mapping table (quick reference)

| Feature | Frontend component | Service method | Backend route | Controller |
|---|---:|---|---|---|
| Teacher list | `TeacherList.jsx` | `teacherService.getAllTeachers` / `getTeachersWithRatings` | `GET /api/teachers` | `teacherController.getAllTeachers` / `getTeachersWithRatings` |
| Teacher search | `TeacherList.jsx` | same | `GET /api/teachers?search=` | `teacherController.getAllTeachers` |
| Teacher detail | `TeacherDetail.jsx` | `teacherService.getTeacherById` | `GET /api/teachers/:id` | `teacherController.getTeacherById` |
| Create review | `ReviewForm.jsx` | `reviewService.createReview` | `POST /api/reviews` | `reviewController.addReview` |
| List reviews | `ReviewList.jsx` | `reviewService.getReviews` | `GET /api/reviews` | `reviewController.getReviews` |
| Flag review | `ReviewCard.jsx` | `reviewService.flagReview` | `POST /api/reviews/:id/flag` | `reviewController.flagReview` |
| Search reviews | `ReviewList.jsx` | `reviewService.getReviews(filters)` | `GET /api/reviews?teacher=&course=&term=` | `reviewController.getReviews` |

---

If you want, I can now:
- scaffold `backend/utils/ratingCalculator.js` and refactor `getAllTeachers` to avoid N+1 (recommended), or
- add TODO comments and small patches for validation middleware.

---

**File created:** `FEATURE_WORKFLOW.md`
