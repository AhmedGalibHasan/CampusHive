import React, { useState } from 'react';
import './ClubSearchFilter.css';

const ClubSearchFilter = ({ onSearch, onFilter, onCategoryChange, currentFilter, currentCategory, currentSearch }) => {
  const [searchTerm, setSearchTerm] = useState(currentSearch || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filter) => {
    onFilter(filter);
  };

  const handleCategoryChange = (e) => {
    onCategoryChange(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    onSearch('');
    onFilter('all');
    onCategoryChange('all');
  };

  return (
    <div className="club-search-filter">
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search clubs by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="clear-search-btn"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">Sort by:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Clubs
            </button>
            <button
              className={`filter-btn ${currentFilter === 'popular' ? 'active' : ''}`}
              onClick={() => handleFilterChange('popular')}
            >
              Most Popular
            </button>
            <button
              className={`filter-btn ${currentFilter === 'newest' ? 'active' : ''}`}
              onClick={() => handleFilterChange('newest')}
            >
              Newest
            </button>
            <button
              className={`filter-btn ${currentFilter === 'joined' ? 'active' : ''}`}
              onClick={() => handleFilterChange('joined')}
            >
              My Clubs
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select
            value={currentCategory || 'all'}
            onChange={handleCategoryChange}
            className="category-filter-select"
          >
            <option value="all">All Categories</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="academic">Academic</option>
            <option value="other">Other</option>
          </select>
        </div>

        {(currentFilter !== 'all' || currentCategory !== 'all' || searchTerm) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ClubSearchFilter;

