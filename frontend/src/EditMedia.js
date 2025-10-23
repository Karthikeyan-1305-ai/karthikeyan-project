import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

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

  useEffect(() => {
    const fetchMediaItem = async () => {
      try {
        const response = await axios.get(`/api/media/${id}`);
        setMediaItem(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching media item:', err);
        setError('Failed to load media item');
        setLoading(false);
      }
    };
    
    fetchMediaItem();
  }, [id]);

  const handleChange = (e) => {
    setMediaItem({ ...mediaItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/media/${id}`, mediaItem);
      alert('✅ Media item updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error updating media:', err);
      alert('❌ Error updating media item');
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
                />
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
                  />
                  <span className="rating-display">{mediaItem.rating ? `${mediaItem.rating}/10` : 'Not rated'}</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">🖼️</span>
                  Cover Image URL
                </label>
                <input
                  type="text"
                  name="coverImageUrl"
                  value={mediaItem.coverImageUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
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
