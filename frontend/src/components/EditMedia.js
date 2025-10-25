import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function EditMedia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Movie',
    status: 'Wishlist',
    genre: '',
    releaseYear: '',
    rating: '',
    coverImageUrl: '',
    notes: ''
  });

  useEffect(() => {
    fetchMediaItem();
  }, [id]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchMediaItem = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      console.log('🔵 Fetching media item:', id);
      
      const response = await axios.get(
        `http://localhost:5000/api/media/${id}`,
        getAuthHeader()
      );

      console.log('🔵 Loaded media item:', response.data);
      setFormData(response.data);
      setLoading(false);

    } catch (error) {
      console.error('🔴 Error fetching media item:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Media item not found');
      } else {
        setError('Error loading media item: ' + error.message);
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      console.log('🔵 Updating media item:', id);
      console.log('🔵 Form data:', formData);

      const response = await axios.put(
        `http://localhost:5000/api/media/${id}`,
        formData,
        getAuthHeader()
      );

      console.log('🔵 Update successful:', response.data);
      alert('✅ Media updated successfully!');
      navigate('/');

    } catch (error) {
      console.error('🔴 Error updating media:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('❌ Error updating media: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="App">
        <header className="header">
          <h1>Loading...</h1>
        </header>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>Please wait while we load the media item...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="header">
          <h1>⚠️ Error</h1>
        </header>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ 
            background: '#ffe6e6', 
            color: '#cc0000', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={handleCancel} 
            className="submit-button"
            style={{ maxWidth: '300px' }}
          >
            ← Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>✏️ Edit Media</h1>
            <p>Update: {formData.title}</p>
          </div>
          <button 
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="form-container" style={{ maxWidth: '800px', margin: '20px auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-icon">🎬</span>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter title"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📁</span>
              Type *
            </label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
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
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="Wishlist">⭐ Wishlist</option>
              <option value="In Progress">▶️ In Progress</option>
              <option value="Completed">✅ Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">🎭</span>
              Genre
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre || ''}
              onChange={handleInputChange}
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
              value={formData.releaseYear || ''}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">⭐</span>
              Rating (0-10)
            </label>
            <input
              type="number"
              name="rating"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating || ''}
              onChange={handleInputChange}
              placeholder="Rate from 0 to 10"
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">🖼️</span>
              Cover Image URL
            </label>
            <input
              type="text"
              name="coverImageUrl"
              value={formData.coverImageUrl || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Add your thoughts, reviews, or reminders..."
              rows="4"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="submit-button" style={{ flex: 1 }}>
              💾 Save Changes
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              style={{
                flex: 1,
                padding: '12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>

      <footer className="footer">
        <p>Editing: {formData.title || 'Media Item'}</p>
      </footer>
    </div>
  );
}

export default EditMedia;
