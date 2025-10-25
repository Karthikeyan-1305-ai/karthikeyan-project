import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EditMedia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mediaItem, setMediaItem] = useState({
    title: '',
    type: 'Movie',
    status: 'Wishlist',
    genre: '',
    releaseYear: '',
    rating: '',
    coverImageUrl: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Helper: get Authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchMediaItem = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/media/${id}`, getAuthHeader());
        setMediaItem(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching media item:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load media item');
        }
        setLoading(false);
      }
    };

    fetchMediaItem();
  }, [id, navigate]);

  // Validation logic
  const validateForm = () => {
    const errors = {};
    if (mediaItem.releaseYear && !/^\d{4}$/.test(mediaItem.releaseYear)) {
      errors.releaseYear = 'Year must be 4 digits (e.g., 2024)';
    }
    if (mediaItem.rating) {
      const rating = parseFloat(mediaItem.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errors.rating = 'Rating must be between 0 and 10';
      }
    }
    if (mediaItem.coverImageUrl && mediaItem.coverImageUrl.trim() !== '') {
      try {
        const url = new URL(mediaItem.coverImageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.coverImageUrl = 'URL must start with http:// or https://';
        }
      } catch {
        errors.coverImageUrl = 'Please enter a valid URL';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMediaItem({ ...mediaItem, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('❌ Please fix the validation errors');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.put(`${API_URL}/api/media/${id}`, mediaItem, getAuthHeader());
      alert('✅ Media item updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error updating media:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('❌ Error updating media item');
      }
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>⚠️ {error}</h2>
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="edit-page-header">
        <button onClick={() => navigate('/')} className="back-button-top">
          ← Back to Catalog
        </button>
        <h1>✏️ Edit Media Item</h1>
        <p>Update your entertainment details</p>
      </div>

      <div className="edit-form-wrapper">
        <div className="edit-preview-card">
          {mediaItem.coverImageUrl && (
            <div className="preview-image-container">
              <img src={mediaItem.coverImageUrl} alt={mediaItem.title} className="preview-image" />
            </div>
          )}
          <h2>{mediaItem.title || 'Untitled'}</h2>
          <div className="preview-details">
            <span className="preview-badge">{mediaItem.type}</span>
            <span className="preview-badge status-badge">{mediaItem.status}</span>
            {mediaItem.rating && (
              <span className="preview-badge rating-badge">⭐ {mediaItem.rating}/10</span>
            )}
          </div>
        </div>

        <div className="edit-form-card">
          <h2>📝 Edit Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">🎬</span>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={mediaItem.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  required
                />
              </div>
            </div>
            <div className="form-row two-columns">
              <div className="form-group">
                <label>
                  <span className="label-icon">📁</span>
                  Type *
                </label>
                <select name="type" value={mediaItem.type} onChange={handleChange}>
                  <option value="Movie">🎬 Movie</option>
                  <option value="TV Show">📺 TV Show</option>
                  <option value="Book">📚 Book</option>
                  <option value="Music">🎵 Music</option>
                  <option value="Game">🎮 Game</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">📊</span>
                  Status *
                </label>
                <select name="status" value={mediaItem.status} onChange={handleChange}>
                  <option value="Wishlist">⭐ Wishlist</option>
                  <option value="In Progress">▶️ In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row two-columns">
              <div className="form-group">
                <label>
                  <span className="label-icon">🎭</span>
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={mediaItem.genre || ''}
                  onChange={handleChange}
                  placeholder="e.g., Action, Drama"
                />
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">📅</span>
                  Release Year
                </label>
                <input
                  type="text"
                  name="releaseYear"
                  value={mediaItem.releaseYear || ''}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  maxLength="4"
                  pattern="\d{4}"
                  style={{ borderColor: validationErrors.releaseYear ? 'red' : '' }}
                />
                {validationErrors.releaseYear && (
                  <span style={{ color: 'red', fontSize: '12px' }}>
                    {validationErrors.releaseYear}
                  </span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">⭐</span>
                  Rating (0-10)
                </label>
                <div className="rating-input-container">
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="10"
                    step="0.1"
                    value={mediaItem.rating || ''}
                    onChange={handleChange}
                    placeholder="Rate from 0 to 10"
                    style={{ borderColor: validationErrors.rating ? 'red' : '' }}
                  />
                  <span className="rating-display">{mediaItem.rating ? `${mediaItem.rating}/10` : 'Not rated'}</span>
                </div>
                {validationErrors.rating && (
                  <span style={{ color: 'red', fontSize: '12px', display: 'block' }}>
                    {validationErrors.rating}
                  </span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">🖼️</span>
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImageUrl"
                  value={mediaItem.coverImageUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={{ borderColor: validationErrors.coverImageUrl ? 'red' : '' }}
                />
                {validationErrors.coverImageUrl && (
                  <span style={{ color: 'red', fontSize: '12px' }}>
                    {validationErrors.coverImageUrl}
                  </span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={mediaItem.notes || ''}
                  onChange={handleChange}
                  placeholder="Add your thoughts, reviews, or reminders..."
                  rows="5"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => navigate('/')} className="cancel-button">
                ✖ Cancel
              </button>
              <button type="submit" className="save-button">
                💾 Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedia;
