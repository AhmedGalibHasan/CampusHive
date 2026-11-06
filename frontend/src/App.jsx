import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import TeacherList from './components/faculty-review/TeacherList';
import TeacherDetail from './components/faculty-review/TeacherDetail';
import ReviewList from './components/faculty-review/ReviewList';
import StudyRoomList from './components/study-corner/StudyRoomList';
import StudyRoomDetail from './components/study-corner/StudyRoomDetail';
import Feed from './components/feed/Feed.jsx';
import Chat from './components/chat/Chat.jsx';
import RideBuddy from './components/ride-buddy/RideBuddy.jsx';
import Clubs from './components/clubs/Clubs.jsx';
import Events from './components/events/Events.jsx';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride-buddy"
            element={
              <ProtectedRoute>
                <RideBuddy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs"
            element={
              <ProtectedRoute>
                <Clubs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          
          {/* Faculty Review Routes */}
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <TeacherList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers/:teacherId"
            element={
              <ProtectedRoute>
                <TeacherDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <ReviewList />
              </ProtectedRoute>
            }
          />
          
          {/* Study Corner Routes */}
          <Route
            path="/study-rooms"
            element={
              <ProtectedRoute>
                <StudyRoomList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-rooms/:roomId"
            element={
              <ProtectedRoute>
                <StudyRoomDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

