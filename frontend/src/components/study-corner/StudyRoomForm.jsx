import React, { useState } from 'react';
import studyRoomService from '../../services/studyRoomService';
import './StudyRoomForm.css';

const StudyRoomForm = ({ onRoomCreated }) => {
  const [formData, setFormData] = useState({
    topic: '',
    location: '',
    socialMediaLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that at least location or socialMediaLink is provided
    if (!formData.location && !formData.socialMediaLink) {
      setError('Please provide either a location or a social media link');
      return;
    }

    if (!formData.topic.trim()) {
      setError('Topic is required');
      return;
    }

    setLoading(true);

    try {
      await studyRoomService.createStudyRoom({
        topic: formData.topic.trim(),
        location: formData.location.trim() || undefined,
        socialMediaLink: formData.socialMediaLink.trim() || undefined,
      });

      // Reset form
      setFormData({
        topic: '',
        location: '',
        socialMediaLink: '',
      });

      if (onRoomCreated) {
        onRoomCreated();
      }

      alert('Study room created successfully!');
    } catch (error) {
      setError(error.message || 'Failed to create study room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="study-room-form" onSubmit={handleSubmit}>
      <h3>Create Study Room</h3>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="topic">Topic *</label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
          placeholder="e.g., CSE470 Final Exam Prep"
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location (On-Campus)</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Library Room 201"
        />
        <small className="form-hint">Leave empty if this is a virtual session</small>
      </div>

      <div className="form-group">
        <label htmlFor="socialMediaLink">Social Media Link (Virtual/Off-Campus)</label>
        <input
          type="url"
          id="socialMediaLink"
          name="socialMediaLink"
          value={formData.socialMediaLink}
          onChange={handleChange}
          placeholder="e.g., https://meet.google.com/abc-defg-hij"
        />
        <small className="form-hint">Leave empty if this is an on-campus session</small>
      </div>

      <div className="form-note">
        <p>Note: You must provide either a Location (for on-campus sessions) or a Social Media Link (for virtual/off-campus sessions).</p>
      </div>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Creating...' : 'Create Study Room'}
      </button>
    </form>
  );
};

export default StudyRoomForm;

