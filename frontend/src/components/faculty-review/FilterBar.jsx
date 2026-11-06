import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, courses = [], terms = [] }) => {
  const [teachers, setTeachers] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters || {});

  useEffect(() => {
    // Fetch teachers for the filter dropdown
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers({ limit: 1000 });
        setTeachers(response.teachers || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value || undefined,
    };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      sortBy: 'date',
      sortOrder: 'newest',
    };
    setLocalFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  // Extract unique courses and terms from reviews if not provided
  const uniqueCourses = [...new Set(courses)].sort();
  const uniqueTerms = [...new Set(terms)].sort();

  return (
    <div className="filter-bar">
      <div className="filter-group filter-teacher">
        <label htmlFor="teacher-filter">Teacher:</label>
        <select
          id="teacher-filter"
          value={localFilters.teacher || ''}
          onChange={(e) => handleChange('teacher', e.target.value)}
        >
          <option value="">All Teachers</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-course">
        <label htmlFor="course-filter">Course:</label>
        <input
          id="course-filter"
          type="text"
          placeholder="Enter course name"
          value={localFilters.course || ''}
          onChange={(e) => handleChange('course', e.target.value)}
        />
      </div>

      <div className="filter-group filter-term">
        <label htmlFor="term-filter">Term:</label>
        <input
          id="term-filter"
          type="text"
          placeholder="Enter term (e.g., Fall 2024)"
          value={localFilters.term || ''}
          onChange={(e) => handleChange('term', e.target.value)}
        />
      </div>

      <div className="filter-group filter-sort-by">
        <label htmlFor="sort-by-filter">Sort By:</label>
        <select
          id="sort-by-filter"
          value={localFilters.sortBy || 'date'}
          onChange={(e) => {
            const newFilters = {
              ...localFilters,
              sortBy: e.target.value,
              // Reset sortOrder when changing sortBy
              sortOrder: e.target.value === 'date' ? 'newest' : 'high',
            };
            setLocalFilters(newFilters);
            if (onFilterChange) {
              onFilterChange(newFilters);
            }
          }}
        >
          <option value="date">Date</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="filter-group filter-sort-order">
        <label htmlFor="sort-order-filter">Sort Order:</label>
        <select
          id="sort-order-filter"
          value={localFilters.sortOrder || (localFilters.sortBy === 'rating' ? 'high' : 'newest')}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
        >
          {(localFilters.sortBy || 'date') === 'rating' ? (
            <>
              <option value="high">High to Low</option>
              <option value="low">Low to High</option>
            </>
          ) : (
            <>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </>
          )}
        </select>
      </div>

      <button className="clear-filters" onClick={handleClear}>
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;

