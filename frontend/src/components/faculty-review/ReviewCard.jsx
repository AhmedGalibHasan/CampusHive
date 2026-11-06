import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import './ReviewCard.css';

const ReviewCard = ({ review, onFlagged, onUpdated, onDeleted, currentUserId }) => {
  const [localReview, setLocalReview] = useState(review);
  const [userFlag, setUserFlag] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    course: review?.course || '',
    term: review?.term || '',
    rating: review?.rating || 5,
    textContent: review?.textContent || '',
  });

  // Get current user's flag from the review
  useEffect(() => {
    if (currentUserId && localReview.userFlags) {
      const flag = localReview.userFlags.find(
        f => f.userId === currentUserId || f.userId?._id === currentUserId || f.userId?.toString() === currentUserId
      );
      setUserFlag(flag?.flagType || null);
    }
  }, [currentUserId, localReview.userFlags]);

  useEffect(() => {
    setLocalReview(review);
    setEditForm({
      course: review?.course || '',
      term: review?.term || '',
      rating: review?.rating || 5,
      textContent: review?.textContent || '',
    });
  }, [review]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFlag = async (flagType) => {
    if (!currentUserId) {
      alert('Please log in to flag reviews');
      return;
    }

    try {
      const response = await reviewService.flagReview(
        localReview.reviewId, 
        flagType
      );
      
      // Update local state with new flag counts and user flag
      setLocalReview(prev => ({
        ...prev,
        positiveFlags: response.review.positiveFlags,
        negativeFlags: response.review.negativeFlags,
        userFlags: prev.userFlags || [],
      }));

      setUserFlag(response.review.userFlag);

      if (onFlagged) {
        onFlagged(localReview.reviewId, response.review);
      }
    } catch (error) {
      alert(`Error flagging review: ${error.message || 'Unknown error'}`);
    }
  };

  const getReviewerId = () => {
    return (
      localReview?.reviewer?._id ||
      localReview?.reviewer?.id ||
      localReview?.reviewer ||
      null
    );
  };

  const isOwner = () => {
    const reviewerId = getReviewerId();
    if (!reviewerId || !currentUserId) return false;
    return reviewerId.toString() === currentUserId.toString();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleEditCancel = () => {
    setEditError('');
    setEditLoading(false);
    setIsEditing(false);
    setEditForm({
      course: localReview?.course || '',
      term: localReview?.term || '',
      rating: localReview?.rating || 5,
      textContent: localReview?.textContent || '',
    });
  };

  const handleEditSave = async () => {
    setEditError('');
    setEditLoading(true);
    try {
      const updated = await reviewService.updateReview(localReview.reviewId, {
        course: editForm.course,
        term: editForm.term,
        rating: editForm.rating,
        textContent: editForm.textContent,
      });

      setLocalReview(updated);
      setIsEditing(false);

      if (onUpdated) {
        onUpdated(updated.reviewId, updated);
      }
    } catch (error) {
      setEditError(error?.message || 'Failed to update review');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm('Delete this review? This cannot be undone.');
    if (!ok) return;

    try {
      await reviewService.deleteReview(localReview.reviewId);
      if (onDeleted) {
        onDeleted(localReview.reviewId);
      }
    } catch (error) {
      alert(error?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`star ${i < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  const positiveFlags = localReview.positiveFlags || 0;
  const negativeFlags = localReview.negativeFlags || 0;
  const isPositiveFlagged = userFlag === 'positive';
  const isNegativeFlagged = userFlag === 'negative';

  const showEditedAt = !!localReview?.editedAt;

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-meta">
          <div className="reviewer-name">
            {localReview.reviewer?.name || 'Anonymous'}
          </div>
          <div className="review-date">{formatDate(localReview.createdAt)}</div>
          {showEditedAt && (
            <div className="review-edited">Last edited: {formatDateTime(localReview.editedAt)}</div>
          )}
        </div>
        <div className="review-header-right">
          <div className="review-rating">{renderStars(localReview.rating)}</div>
          {isOwner() && !isEditing && (
            <div className="review-owner-actions">
              <button
                type="button"
                className="review-action-button"
                onClick={() => {
                  setEditError('');
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="review-action-button review-action-button-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {!isEditing ? (
        <>
          <div className="review-details">
            <div className="review-course-term">
              <span className="course">{localReview.course}</span>
              <span className="term">{localReview.term}</span>
            </div>
            {localReview.teacher && (
              <div className="review-teacher">
                Teacher: {localReview.teacher.name}
              </div>
            )}
          </div>
          <div className="review-content">{localReview.textContent}</div>
        </>
      ) : (
        <div className="review-edit-form">
          {editError && <div className="review-edit-error">{editError}</div>}
          <div className="review-edit-grid">
            <div className="review-edit-field">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={editForm.course}
                onChange={handleEditChange}
              />
            </div>
            <div className="review-edit-field">
              <label>Term</label>
              <input
                type="text"
                name="term"
                value={editForm.term}
                onChange={handleEditChange}
              />
            </div>
            <div className="review-edit-field">
              <label>Rating</label>
              <select name="rating" value={editForm.rating} onChange={handleEditChange}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
          </div>
          <div className="review-edit-field">
            <label>Review</label>
            <textarea
              name="textContent"
              value={editForm.textContent}
              onChange={handleEditChange}
              rows={4}
            />
          </div>

          <div className="review-edit-actions">
            <button
              type="button"
              className="review-action-button"
              onClick={handleEditCancel}
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="review-action-button"
              onClick={handleEditSave}
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
      
      {!isEditing && (
        <div className="review-flags-section">
          <div className="flag-buttons">
            <button 
              className={`flag-button flag-button-positive ${isPositiveFlagged ? 'flagged-active' : ''}`}
              onClick={() => handleFlag('positive')}
              title={isPositiveFlagged ? "You marked this as helpful" : "Mark as helpful/positive"}
              disabled={isPositiveFlagged}
            >
              <span className="flag-icon">+</span>
              <span className="flag-label">Helpful</span>
            </button>
            <button 
              className={`flag-button flag-button-negative ${isNegativeFlagged ? 'flagged-active' : ''}`}
              onClick={() => handleFlag('negative')}
              title={isNegativeFlagged ? "You marked this as not helpful" : "Mark as unhelpful/negative"}
              disabled={isNegativeFlagged}
            >
              <span className="flag-icon">−</span>
              <span className="flag-label">Not Helpful</span>
            </button>
          </div>
          <div className="flag-counts">
            <span className="flag-count flag-count-positive">
              <span className="flag-count-icon">+</span>
              {positiveFlags}
            </span>
            <span className="flag-count flag-count-negative">
              <span className="flag-count-icon">−</span>
              {negativeFlags}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;

