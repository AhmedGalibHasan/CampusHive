import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import studyRoomService from '../../services/studyRoomService';
import StudyRoomCard from './StudyRoomCard';
import StudyRoomForm from './StudyRoomForm';
import FilterBar from './FilterBar';
import './StudyRoomList.css';

const StudyRoomList = () => {
  const location = useLocation();
  const [studyRooms, setStudyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchStudyRooms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await studyRoomService.getAllStudyRooms({
        limit: 1000,
        search: filters.search || undefined,
      });
      setStudyRooms(response.studyRooms || []);
    } catch (error) {
      setError(error.message || 'Failed to load study rooms');
      setStudyRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyRooms();
  }, [filters]);

  // Refresh when navigating back to this page (e.g., from a study room detail)
  useEffect(() => {
    if (location.pathname === '/study-rooms') {
      fetchStudyRooms();
    }
  }, [location.pathname]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRoomCreated = () => {
    setShowCreateForm(false);
    fetchStudyRooms();
  };

  return (
    <div className="study-room-list">
      <div className="study-room-list-header">
        <h2>📚 Study Corner</h2>
        <div className="header-actions">
          <Link to="/dashboard" className="back-to-dashboard-link">
            ← Back To Dashboard
          </Link>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="create-room-section">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-room-button"
        >
          {showCreateForm ? 'Cancel' : '+ Create Study Room'}
        </button>
      </div>

      {showCreateForm && (
        <StudyRoomForm onRoomCreated={handleRoomCreated} />
      )}

      {loading && <div className="loading">Loading study rooms...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && studyRooms.length === 0 && (
        <div className="no-study-rooms">
          No study rooms found. Be the first to create one!
        </div>
      )}

      {!loading && !error && studyRooms.length > 0 && (
        <div className="study-rooms-grid">
          {studyRooms.map((room) => (
            <StudyRoomCard key={room._id} studyRoom={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyRoomList;

