import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import teacherService from '../../services/teacherService';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import RatingDisplay from './RatingDisplay';
import './TeacherDetail.css';
import { getTeacherImageUrl, handleImageError } from '../../utils/imageUtils';

const TeacherDetail = () => {
  const { teacherId } = useParams();
  const { user } = useContext(AuthContext);
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    setLoading(true);
    setError('');

    try {
      const [teacherData, reviewsData] = await Promise.all([
        teacherService.getTeacherById(teacherId),
        teacherService.getTeacherReviews(teacherId, { limit: 50 }),
      ]);

      setTeacher(teacherData);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      setError(error.message || 'Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchTeacherData();
  };

  const handleReviewFlagged = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.reviewId === reviewId
          ? { ...review, isFlagged: true }
          : review
      )
    );
  };

  const handleReviewUpdated = () => {
    // Refresh teacher stats + review list (rating/total reviews can change)
    fetchTeacherData();
  };

  const handleReviewDeleted = () => {
    // Refresh teacher stats + review list (rating/total reviews can change)
    fetchTeacherData();
  };

  // Get current user ID from auth context
  const getCurrentUserId = () => {
    return user?.id || user?._id || null;
  };

  if (loading) {
    return <div className="loading">Loading teacher information...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!teacher) {
    return <div className="error">Teacher not found</div>;
  }

  return (
    <div className="teacher-detail">
      <Link to="/teachers" className="back-link">
        ← Back to Teachers
      </Link>

      <div className="teacher-header">
        <div className="teacher-image-section">
          <img
            src={getTeacherImageUrl(teacher.imagePath)}
            alt={teacher.name}
            className="teacher-detail-image"
            onError={handleImageError}
          />
        </div>
        <div className="teacher-info-section">
          <h1>{teacher.name}</h1>
          <p className="teacher-designation">{teacher.designation}</p>
          <p className="teacher-email">{teacher.email}</p>
          {teacher.averageRating > 0 && (
            <div className="teacher-rating-section">
              <RatingDisplay
                rating={teacher.averageRating}
                totalReviews={teacher.totalReviews}
              />
              {teacher.ratingDistribution && (
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span>5★</span>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${
                            (teacher.ratingDistribution[5] /
                              teacher.totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span>{teacher.ratingDistribution[5] || 0}</span>
                  </div>
                  <div className="rating-bar">
                    <span>4★</span>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${
                            (teacher.ratingDistribution[4] /
                              teacher.totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span>{teacher.ratingDistribution[4] || 0}</span>
                  </div>
                  <div className="rating-bar">
                    <span>3★</span>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${
                            (teacher.ratingDistribution[3] /
                              teacher.totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span>{teacher.ratingDistribution[3] || 0}</span>
                  </div>
                  <div className="rating-bar">
                    <span>2★</span>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${
                            (teacher.ratingDistribution[2] /
                              teacher.totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span>{teacher.ratingDistribution[2] || 0}</span>
                  </div>
                  <div className="rating-bar">
                    <span>1★</span>
                    <div className="bar-container">
                      <div
                        className="bar"
                        style={{
                          width: `${
                            (teacher.ratingDistribution[1] /
                              teacher.totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span>{teacher.ratingDistribution[1] || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {teacher.averageRating === 0 && (
            <div className="no-rating">No reviews yet</div>
          )}
        </div>
      </div>

      <div className="teacher-actions">
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="toggle-review-form-button"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {showReviewForm && (
        <ReviewForm
          teacherId={teacher._id}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <div className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="no-reviews">
            No reviews yet. Be the first to write a review!
          </div>
        ) : (
          <div className="reviews-list">
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
        )}
      </div>
    </div>
  );
};

export default TeacherDetail;

