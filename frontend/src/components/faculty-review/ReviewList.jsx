import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import FilterBar from './FilterBar';
import './ReviewList.css';

const ReviewList = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'date',
    sortOrder: 'newest',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchReviews = async (currentFilters = filters, page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await reviewService.getReviews({
        ...currentFilters,
        page,
        limit: pagination.limit,
      });

      setReviews(response.reviews || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      setError(error.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchReviews(newFilters, 1);
  };

  const handlePageChange = (newPage) => {
    fetchReviews(filters, newPage);
  };

  const handleReviewFlagged = (reviewId, updatedReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.reviewId === reviewId
          ? { ...review, ...updatedReview }
          : review
      )
    );
  };

  const handleReviewUpdated = (reviewId, updatedReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.reviewId === reviewId ? updatedReview : review
      )
    );
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prevReviews) => prevReviews.filter((r) => r.reviewId !== reviewId));
  };

  // Extract unique courses and terms for filter suggestions
  const courses = [...new Set(reviews.map((r) => r.course))];
  const terms = [...new Set(reviews.map((r) => r.term))];

  // Get current user ID from auth context
  const getCurrentUserId = () => {
    return user?.id || user?._id || null;
  };

  return (
    <div className="review-list">
      <div className="review-list-header">
        <h2>📝 Faculty Reviews</h2>
        <Link to="/teachers" className="back-to-teachers-link">
          ← Back To Teachers
        </Link>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        courses={courses}
        terms={terms}
      />

      {loading && <div className="loading">Loading reviews...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && reviews.length === 0 && (
        <div className="no-reviews">No reviews found. Be the first to write a review!</div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="reviews-container">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id || review.reviewId}
                review={review}
                onFlagged={handleReviewFlagged}
                onUpdated={handleReviewUpdated}
                onDeleted={handleReviewDeleted}
                currentUserId={getCurrentUserId()}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;

