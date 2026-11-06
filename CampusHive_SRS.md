# CampusHive - Software Requirements Specification (SRS)

## Table of Contents

1. [Introduction](#1-introduction)
   - [1.1 Purpose](#11-purpose)
   - [1.2 Scope](#12-scope)
   - [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - [1.4 References](#14-references)
   - [1.5 Overview](#15-overview)
2. [Overall Description](#2-overall-description)
   - [2.1 Product Perspective](#21-product-perspective)
   - [2.2 Product Features](#22-product-features)
   - [2.3 User Classes and Characteristics](#23-user-classes-and-characteristics)
   - [2.4 Operating Environment](#24-operating-environment)
   - [2.5 Constraints](#25-constraints)
   - [2.6 Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [System Requirements](#3-system-requirements)
   - [3.1 Functional Requirements](#31-functional-requirements)
   - [3.2 Non-Functional Requirements](#32-non-functional-requirements)
   - [3.3 External Interface Requirements](#33-external-interface-requirements)
4. [Technology Stack & Architectural Overview](#4-technology-stack--architectural-overview)
   - [4.1 MERN Stack Components](#41-mern-stack-components)
   - [4.2 High-Level Architecture](#42-high-level-architecture)
5. [Tentative Development Plan (Agile Methodology)](#5-tentative-development-plan-agile-methodology)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Conclusion](#7-conclusion)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirement Specification (SRS) document outlines the requirements for developing **"CampusHive"** - an all-in-one campus social networking and peer support web application using the MERN stack (MongoDB, Express.js, React.js, Node.js). The primary goal of this application is to facilitate a vibrant and secure campus community, enabling students to connect with peers, find study buddies, share rides, discover campus events and clubs, leave faculty reviews, access emergency services, and engage in meaningful academic and social interactions—all within a single integrated platform.

### 1.2 Scope

The scope of this project includes the design, development, testing, and deployment of the campus web application, catering to:

- **Students** who can register, create and join clubs/events, schedule study sessions, find ride-sharing partners, book rides, chat with peers, and access notifications.
- **Faculty Members** who can be reviewed and rated by students, manage class information, and communicate with students.
- **Administrators** who oversee system operations, manage user roles, moderate content, and maintain platform compliance and integrity.

This SRS covers the functional and non-functional requirements for the project, the constraints, assumptions, high-level design, and the development plan following Agile methodology.

### 1.3 Definitions, Acronyms, and Abbreviations

- **MERN:** MongoDB, Express.js, React.js, Node.js
- **CORS:** Cross-Origin Resource Sharing
- **JWT:** JSON Web Token
- **REST:** Representational State Transfer
- **CRUD:** Create, Read, Update, Delete
- **RBAC:** Role-Based Access Control
- **API:** Application Programming Interface
- **UI/UX:** User Interface / User Experience

### 1.4 References

- MERN Stack Documentation:
  - MongoDB: https://docs.mongodb.com
  - Express.js: https://expressjs.com
  - React.js: https://react.dev
  - Node.js: https://nodejs.org
- Project Repository: https://github.com/[username]/CampusHive

### 1.5 Overview

Section 2 provides an overall description of the product, including its user classes and environment. Section 3 details the functional and non-functional requirements. Section 4 outlines the technology stack and architectural overview. Section 5 presents the development plan, including sprint-wise breakdown and deliverables.

---

## 2. Overall Description

### 2.1 Product Perspective

The campus social networking web application is a standalone system built on the MERN stack. It integrates with external services where necessary (e.g., authentication providers, email/SMS gateways, geolocation APIs). The application prioritizes user security, data privacy, and intuitive user experience while maintaining high performance and scalability.

### 2.2 Product Features

- **User Authentication & Authorization:** Secure registration and login with JWT-based authentication; role-based access control for students, faculty, and admins.
- **Social Networking:** User profiles, social feed with posts/comments, real-time chat and messaging between students.
- **Club & Event Management:** Create and manage clubs; organize campus events with RSVP functionality; browse and filter clubs and events by category.
- **Study Corner (Study Rooms):** Create virtual study rooms for collaborative academic work; real-time messaging within study groups; session scheduling.
- **Ride Buddy System:** Browse available rides and riders; request and offer rides; cost-sharing and payment integration; driver/rider ratings and reviews.
- **Faculty Review & Ratings:** Rate and review faculty members; view aggregated ratings; provide constructive feedback on teaching quality and accessibility.
- **Notifications:** Real-time in-app notifications for chat messages, event updates, ride confirmations, study room invites, and platform announcements.
- **User Dashboard:** Personalized dashboard displaying upcoming events, study sessions, rides, clubs joined, and notifications.
- **Security & Privacy:** Encrypted communication, user data protection, and reporting mechanisms for inappropriate behavior.

### 2.3 User Classes and Characteristics

**Students:** The primary users of the application. They seek to connect with peers, join clubs, attend events, find study partners, share rides, and leave feedback on faculty. Typically tech-savvy, mobile-first users requiring an intuitive, fast interface.

**Faculty Members:** Secondary users whose profiles are available for student reviews and ratings. They may optionally participate in the platform for announcements and communications. Require minimal technical interaction.

**Administrators:** System overseers responsible for user moderation, content management, platform maintenance, and analytics. Have full access to system settings and administrative dashboards. Require robust tools for monitoring and enforcement.

### 2.4 Operating Environment

- **Web Application:** Accessible on modern web browsers (Chrome, Firefox, Edge, Safari).
- **Mobile Compatibility:** Responsive design optimized for smartphones and tablets.
- **Server-Side:** Node.js and Express.js running in a containerized or cloud environment.
- **Database:** MongoDB cluster (preferably cloud-managed for scalability and backups).
- **Hosting:** Deployment on AWS, Azure, Google Cloud, or equivalent production environment.
- **Real-time Communication:** WebSockets for live chat, notifications, and updates.

### 2.5 Constraints

- **Data Privacy:** Must adhere to data protection regulations and best practices for user privacy.
- **Security:** Must implement encryption in transit (HTTPS/SSL) and sensitive data encryption at rest.
- **Performance:** System must support concurrent users with minimal latency for real-time features (chat, notifications).
- **Scalability:** Architecture should enable horizontal scaling to handle growth in user base.
- **Time & Resource:** Project to be delivered within 8–9 weeks with a team of 3–4 developers.
- **Browser Compatibility:** Must support major modern browsers with graceful degradation for older versions.

### 2.6 Assumptions and Dependencies

- Users have a stable internet connection for optimal application experience.
- Third-party services (email/SMS providers, payment gateways, geolocation APIs) are available and reliable.
- Mobile users will grant location permissions when prompted for ride-sharing features.
- Database backups and disaster recovery infrastructure are in place.
- Users have valid email addresses for registration and communication.

---

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication & Authorization

**User Registration & Login:**
- **FR-1:** The system shall provide secure user registration with email verification.
- **FR-2:** Users shall be able to log in using email/username and password with JWT authentication.
- **FR-3:** The system shall support password reset functionality via email verification links.

**Role-Based Access Control (RBAC):**
- **FR-4:** The system shall provide differentiated dashboards and access levels for students, faculty, and admins.
- **FR-5:** Students shall have access to all primary features (chat, clubs, events, study rooms, ride buddy, reviews).
- **FR-6:** Faculty profiles shall be viewable by students for review and rating purposes.
- **FR-7:** Administrators shall have access to moderation tools, user management, and analytics dashboards.

#### 3.1.2 Social Networking & Communication

**User Profiles:**
- **FR-8:** Students shall be able to create and customize their profiles with profile picture, bio, interests, and contact information.
- **FR-9:** Users shall be able to search for and view other student profiles.

**Feed & Posts:**
- **FR-10:** Students shall be able to create, edit, and delete posts on the social feed.
- **FR-11:** Students shall be able to comment on posts and engage with other users' content.
- **FR-12:** The feed shall display posts in chronological or trending order with filtering options.

**Real-Time Chat:**
- **FR-13:** Students shall be able to send and receive direct messages with other students.
- **FR-14:** The system shall provide real-time notifications for new messages.
- **FR-15:** Users shall be able to view message history and clear conversations.

#### 3.1.3 Clubs & Events Management

**Clubs:**
- **FR-16:** Students shall be able to create clubs with name, description, category, and cover image.
- **FR-17:** Students shall be able to browse, search, and join clubs.
- **FR-18:** Club administrators shall be able to manage club settings, members, and send announcements.
- **FR-19:** The system shall display club member lists and activity feeds.

**Events:**
- **FR-20:** Club members shall be able to create events with date, time, location, description, and capacity.
- **FR-21:** Students shall be able to RSVP for events and receive reminders.
- **FR-22:** The system shall display upcoming events with filtering by category, date, and location.
- **FR-23:** Event creators shall be able to manage attendee lists and send event updates.

#### 3.1.4 Study Corner (Study Rooms)

**Study Room Creation & Management:**
- **FR-24:** Students shall be able to create virtual study rooms with subject, topic, and participant limit.
- **FR-25:** Students shall be able to join existing study rooms and view active sessions.
- **FR-26:** Study room creators shall be able to manage participants and set room schedules.

**In-Room Collaboration:**
- **FR-27:** Study room participants shall have access to real-time messaging within the room.
- **FR-28:** The system shall store study session history with timestamps and participant information.

#### 3.1.5 Ride Buddy System

**Ride Creation & Browsing:**
- **FR-29:** Students shall be able to offer rides with departure location, destination, date, time, and available seats.
- **FR-30:** Students shall be able to request rides matching their travel needs.
- **FR-31:** Ride requests shall show estimated cost based on distance and seat availability.

**Ride Management:**
- **FR-32:** Riders and drivers shall be able to communicate via in-app messaging.
- **FR-33:** The system shall display real-time driver/rider location on a map (with privacy controls).
- **FR-34:** Drivers and riders shall be able to rate and review each other after trip completion.
- **FR-35:** The system shall handle payment splitting between ride participants.

**Safety Features:**
- **FR-36:** The system shall display driver and rider profiles with ratings and verification status.
- **FR-37:** Users shall have the ability to report unsafe behavior or cancel rides with explanations.

#### 3.1.6 Faculty Review & Ratings

**Review Management:**
- **FR-38:** Students shall be able to create, edit, and delete reviews for faculty members.
- **FR-39:** Reviews shall include a rating (1-5 stars) and optional written feedback.
- **FR-40:** The system shall prevent spam by limiting review frequency per user per faculty member.

**Faculty Profiles:**
- **FR-41:** Faculty profiles shall display aggregated ratings, review count, and student feedback.
- **FR-42:** Faculty shall have the option to respond to reviews or provide clarifications.
- **FR-43:** Administrators shall be able to flag and remove inappropriate reviews.

#### 3.1.7 Notifications

**Notification Types:**
- **FR-44:** The system shall send notifications for new messages, event updates, ride confirmations, and study room invites.
- **FR-45:** Users shall be able to customize notification preferences (email, in-app, push notifications).
- **FR-46:** Notifications shall include real-time in-app alerts with unread count indicators.

#### 3.1.8 User Dashboard

**Dashboard Features:**
- **FR-47:** Students shall have a personalized dashboard displaying upcoming events, study sessions, rides, and active clubs.
- **FR-48:** The dashboard shall show recent notifications and activity summaries.

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements

- **NFR-1:** The system should load pages within 3 seconds under normal network conditions.
- **NFR-2:** Real-time features (chat, notifications, ride tracking) should have latency under 1 second.
- **NFR-3:** The system should handle at least 100 concurrent users without significant performance degradation.
- **NFR-4:** Search queries should return results within 500ms.

#### 3.2.2 Security Requirements

- **NFR-5:** All communication between client and server shall occur over HTTPS (SSL/TLS).
- **NFR-6:** Passwords shall be hashed using industry-standard algorithms (bcrypt or similar).
- **NFR-7:** Sensitive user data shall be encrypted at rest.
- **NFR-8:** The system shall implement CORS policy to prevent unauthorized cross-origin requests.
- **NFR-9:** Session tokens (JWT) shall expire after a configurable time period (e.g., 24 hours).
- **NFR-10:** The system shall include protection against common vulnerabilities (SQL injection, XSS, CSRF).

#### 3.2.3 Reliability & Availability

- **NFR-11:** The system shall maintain 99% uptime, excluding scheduled maintenance.
- **NFR-12:** Data backups shall be automated daily to ensure minimal data loss.
- **NFR-13:** The system shall include error logging and monitoring for quick issue detection.
- **NFR-14:** Critical errors shall be logged and monitored for immediate admin notification.

#### 3.2.4 Maintainability

- **NFR-15:** The codebase shall follow consistent naming conventions and established design patterns (MVC, modular architecture).
- **NFR-16:** Code shall be documented with clear comments for complex logic.
- **NFR-17:** API documentation shall be maintained using tools like Swagger/OpenAPI.
- **NFR-18:** The project shall maintain a clear separation between frontend, backend, and database layers.

#### 3.2.5 Scalability

- **NFR-19:** The system architecture shall support horizontal scaling of Node.js instances behind a load balancer.
- **NFR-20:** MongoDB shall be configured for replication and sharding to handle data growth.
- **NFR-21:** The application should support growth to thousands of concurrent users with minimal reconfiguration.

#### 3.2.6 Usability

- **NFR-22:** The UI/UX shall be intuitive and accessible to users with varying technical proficiency.
- **NFR-23:** The application shall be fully responsive on devices of all sizes (mobile, tablet, desktop).
- **NFR-24:** Error messages shall be clear and actionable, guiding users to resolve issues.

### 3.3 External Interface Requirements

#### 3.3.1 User Interfaces

- **UI-1:** A responsive web interface (React.js) that adjusts seamlessly to desktop, tablet, and mobile viewports.
- **UI-2:** Intuitive navigation with clear visual hierarchy and consistent design patterns.
- **UI-3:** Separate dashboards/experiences optimized for each user role (student, faculty, admin).
- **UI-4:** Interactive maps for ride tracking and location-based services.
- **UI-5:** Real-time chat and notification interfaces with unread indicators.

#### 3.3.2 Hardware Interfaces

- **HI-1:** None specific; the system will run on standard cloud server instances or on-premise hardware.
- **HI-2:** The application shall support various input methods (keyboard, mouse, touchscreen).

#### 3.3.3 Software Interfaces

- **SI-1:** Email/SMS services for user verification and notifications (e.g., SendGrid, Twilio, or equivalent).
- **SI-2:** Geolocation APIs for mapping and location-based features (e.g., Google Maps API, Mapbox).
- **SI-3:** Optional: Payment gateway integration for future ride payment processing (Stripe, PayPal, etc.).
- **SI-4:** Authentication services for OAuth integration (optional, for social login).

#### 3.3.4 Communication Interfaces

- **CI-1:** RESTful APIs will be used for communication between front-end (React.js) and back-end (Node.js/Express.js).
- **CI-2:** WebSockets shall be implemented for real-time features (chat, notifications, live updates).
- **CI-3:** JSON shall be the standard data exchange format.

---

## 4. Technology Stack & Architectural Overview

### 4.1 MERN Stack Components

- **MongoDB:** Document-oriented NoSQL database for storing user profiles, posts, messages, clubs, events, study rooms, rides, and reviews.
- **Express.js:** Node.js web framework for building RESTful APIs and handling server-side routing and middleware.
- **React.js:** Front-end library for building a responsive, interactive, and component-based user interface.
- **Node.js:** JavaScript runtime environment for executing the back-end application server-side logic.

**Additional Technologies:**
- **WebSockets (Socket.io):** For real-time communication (chat, notifications, live updates).
- **JWT (JSON Web Tokens):** For secure authentication and authorization.
- **Bcrypt:** For secure password hashing.
- **Vite:** Modern build tool and dev server for React development.
- **Jest:** Testing framework for unit and integration tests.

### 4.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer (React.js)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Components: Auth, Feed, Clubs, Events, Chat, etc.   │   │
│  │ Context API for state management                    │   │
│  │ Services: apiClient, authService, etc.              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                        RESTful APIs
                        WebSockets
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Layer (Express.js/Node.js)       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes: auth, clubs, events, posts, chat, etc.      │   │
│  │ Controllers: Process requests, enforce business rules│   │
│  │ Middleware: Auth, validation, error handling        │   │
│  │ Models: Data schemas and database interactions      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                        Database Queries
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (MongoDB)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections: User, Post, Club, Event, StudyRoom,    │   │
│  │ RideBuddy, Review, Message, Notification, etc.      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Tentative Development Plan (Agile Methodology)

### Sprint 1: Core Setup, Authentication & Social Features

**Objectives:**
- Set up development environment and project structure.
- Implement user authentication (registration, login, password reset).
- Develop social feed with posts and commenting functionality.
- Set up real-time chat between users.

**Deliverables:**
- Project repository with MERN stack setup.
- Authentication API endpoints and frontend components.
- Social feed with CRUD operations for posts.
- Comment system implementation.
- Real-time chat interface and backend (WebSockets).
- User profile management.
- Database schema for User, Post, Comment, and Message collections.

---

### Sprint 2: Community Features & Study Rooms

**Objectives:**
- Build club and event management features.
- Implement study corner (study rooms) functionality.
- Enable real-time messaging within study groups.
- Set up notification system for user interactions.

**Deliverables:**
- Club creation, management, and member browsing.
- Event scheduling, RSVP, and management.
- Study room creation and session management.
- In-room messaging and session history.
- Notification service for chats, events, and study room invites.
- Database schema for Club, Event, StudyRoom, StudyRoomMessage, and Notification collections.

---

### Sprint 3: Ride Buddy, Faculty Reviews & Testing

**Objectives:**
- Develop ride-sharing system with user interactions.
- Implement faculty review and rating system.
- Conduct thorough testing and optimization.
- Deploy to production environment.

**Deliverables:**
- Ride creation, browsing, and request management.
- Driver/rider rating and review system.
- Faculty profile pages with aggregated reviews.
- Student review submission and management.
- Unit and integration tests for critical features.
- Performance optimization and bug fixes.
- Deployment to production.
- API documentation and project handover documentation.
- Database schema for RideBuddy, Review, and Teacher collections.

---

## 6. Acceptance Criteria

The project will be considered complete upon meeting the following acceptance criteria:

1. **Functional Completeness:** All functional requirements (FR-1 through FR-48) are implemented and working as specified.

2. **Non-Functional Standards:** All non-functional requirements are met:
   - Performance targets (page load < 3s, real-time latency < 1s).
   - Security standards (HTTPS, encrypted data, secure authentication).
   - Availability and reliability (99% uptime, automated backups).

3. **Testing:** Comprehensive testing of all critical features including unit and integration tests.

4. **Documentation:** Complete API documentation, architecture diagrams, and database schemas.

5. **User Experience:** Responsive design verified on all major browsers; intuitive navigation confirmed.

6. **Security:** Implementation of authentication, authorization, and data protection measures.

7. **Production Readiness:** Successfully deployed to a production environment with monitoring and logging in place.

---

## 7. Conclusion

This SRS provides a comprehensive outline for the design and development of **"CampusHive"** – a comprehensive campus social networking and peer support web application using the MERN stack. It ensures a student-centric approach by integrating core campus functionalities—social networking, club and event management, collaborative study spaces, ride-sharing, and faculty feedback—while maintaining strict data privacy and security standards.

By following the outlined 3-sprint Agile development plan and maintaining focus on user experience and system reliability, the project successfully delivers a robust, scalable, and engaging solution that enhances campus community and student engagement.

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Status:** Active