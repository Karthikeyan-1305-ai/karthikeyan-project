import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MediaCatalog.css';

function MediaCatalog() {
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    };
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/media', 
        getAuthHeader()
      );
      
      if (Array.isArray(response.data)) {
        setMediaItems(response.data);
      } else {
        setMediaItems([]);
      }
      setError('');
    } catch (err) {
      console.error('Fetch media error:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.code === 'ERR_NETWORK') {
        setError('⚠️ Backend server not running on port 5000');
      } else {
        setError('Failed to load media items');
      }
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/media/${id}`, 
        getAuthHeader()
      );
      
      setMediaItems(mediaItems.filter(item => item.id !== id));
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading media catalog...</div>
      </div>
    );
  }

  return (
    <div className="media-catalog">
      <header className="catalog-header">
        <div className="header-content">
          <h1>🎬 Entertainment Media Catalog</h1>
          <div className="user-section">
            {user && (
              <span className="welcome-text">
                Welcome, <strong>{user.fullName || user.email}</strong>!
              </span>
            )}
            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="media-grid">
          {!Array.isArray(mediaItems) || mediaItems.length === 0 ? (
            <div className="no-items">
              <h2>📽️ No media items yet</h2>
              <p>Start adding your favorite movies, shows, and music!</p>
            </div>
          ) : (
            mediaItems.map(item => (
              <div key={item.id} className="media-card">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="media-image"
                  />
                )}
                <div className="card-content">
                  <h3 className="media-title">{item.title}</h3>
                  {item.rating && (
                    <p className="rating">⭐ {item.rating}/10</p>
                  )}
                  {item.description && (
                    <p className="description">{item.description}</p>
                  )}
                  {item.type && (
                    <span className="media-type-badge">{item.type}</span>
                  )}
                  <div className="card-actions">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaCatalog;
