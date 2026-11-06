import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import RatingDisplay from './RatingDisplay';
import { getTeacherImageUrl, handleImageError } from '../../utils/imageUtils';
import './TeacherList.css';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await teacherService.getAllTeachers({
        limit: 1000,
        search: searchTerm,
      });
      setTeachers(response.teachers || []);
    } catch (error) {
      setError(error.message || 'Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  return (
    <div className="teacher-list">
      <div className="teacher-list-header">
        <h2>👨‍🏫 Faculty Members</h2>
        <div className="header-actions">
          <Link to="/dashboard" className="back-to-dashboard-link">
            ← Back To Dashboard
          </Link>
          <Link to="/reviews" className="view-reviews-link">
            View All Reviews →
          </Link>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search teachers by name, designation, or email..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading && <div className="loading">Loading teachers...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && teachers.length === 0 && (
        <div className="no-teachers">No teachers found.</div>
      )}

      {!loading && !error && teachers.length > 0 && (
        <div className="teachers-grid">
          {teachers.map((teacher) => (
            <Link
              key={teacher._id}
              to={`/teachers/${teacher._id}`}
              className="teacher-card"
            >
              <div className="teacher-image-container">
                <img
                  src={getTeacherImageUrl(teacher.imagePath)}
                  alt={teacher.name}
                  className="teacher-image"
                  onError={handleImageError}
                />
              </div>
              <div className="teacher-info">
                <h3 className="teacher-name">{teacher.name}</h3>
                <p className="teacher-designation">{teacher.designation}</p>
                {teacher.averageRating > 0 && (
                  <RatingDisplay
                    rating={teacher.averageRating}
                    totalReviews={teacher.totalReviews}
                  />
                )}
                {teacher.averageRating === 0 && (
                  <div className="no-rating">No reviews yet</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherList;

