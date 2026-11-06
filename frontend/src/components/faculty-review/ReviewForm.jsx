import React, { useState } from 'react';
import reviewService from '../../services/reviewService';
import './ReviewForm.css';

const ReviewForm = ({ teacherId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    course: '',
    term: '',
    rating: 5,
    textContent: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await reviewService.createReview({
        teacher: teacherId,
        ...formData,
      });

      // Reset form
      setFormData({
        course: '',
        term: '',
        rating: 5,
        textContent: '',
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      alert('Review submitted successfully!');
    } catch (error) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (currentRating) => {
    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;
      return (
        <label key={i} className="star-label">
          <input
            type="radio"
            name="rating"
            value={starValue}
            checked={formData.rating === starValue}
            onChange={handleChange}
          />
          <span className={`star ${starValue <= currentRating ? 'filled' : 'empty'}`}>
            ★
          </span>
        </label>
      );
    });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="course">Course *</label>
        <input
          type="text"
          id="course"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
          placeholder="e.g., CSE470"
        />
      </div>

      <div className="form-group">
        <label htmlFor="term">Term *</label>
        <input
          type="text"
          id="term"
          name="term"
          value={formData.term}
          onChange={handleChange}
          required
          placeholder="e.g., Fall 2024"
        />
      </div>

      <div className="form-group">
        <label>Rating *</label>
        <div className="star-rating">{renderStars(formData.rating)}</div>
      </div>

      <div className="form-group">
        <label htmlFor="textContent">Review *</label>
        <textarea
          id="textContent"
          name="textContent"
          value={formData.textContent}
          onChange={handleChange}
          required
          rows="5"
          placeholder="Write your review here..."
        />
      </div>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;

