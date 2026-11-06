import React from 'react';
import './RatingDisplay.css';

const RatingDisplay = ({ rating, totalReviews, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="rating-display">
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star filled">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="star empty">★</span>
        ))}
      </div>
      <div className="rating-info">
        <span className="rating-value">{rating.toFixed(1)}</span>
        {showCount && totalReviews !== undefined && (
          <span className="review-count">({totalReviews} reviews)</span>
        )}
      </div>
    </div>
  );
};

export default RatingDisplay;

