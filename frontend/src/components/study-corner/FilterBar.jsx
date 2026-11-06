import React, { useState, useEffect } from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange(localFilters);
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
    };
    setLocalFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  return (
    <div className="filter-bar">
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <div className="filter-group">
          <label htmlFor="search-filter">Search:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search by topic or creator name..."
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
        <button type="button" className="clear-filters" onClick={handleClear}>
          Clear
        </button>
      </form>
    </div>
  );
};

export default FilterBar;

