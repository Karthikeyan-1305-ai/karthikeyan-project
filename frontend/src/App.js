import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import EditMedia from './EditMedia';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MainApp() {
  const [mediaItems, setMediaItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/media`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMediaItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching media:', error);
      setMediaItems([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.releaseYear) {
      const year = parseInt(formData.releaseYear, 10);
      if (isNaN(year) || formData.releaseYear.length !== 4 || year < 1900 || year > 2099) {
        alert('Please enter a valid year (1900–2099).');
        return;
      }
    }
    if (formData.rating !== '' && (Number(formData.rating) < 0 || Number(formData.rating) > 10)) {
      alert('Rating must be between 0 and 10.');
      return;
    }
    if (formData.coverImageUrl) {
      try {
        new URL(formData.coverImageUrl);
      } catch {
        alert('Please enter a valid URL.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchMediaItems();
        setShowForm(false);
        setFormData({
          title: '',
          type: 'Movie',
          status: 'Wishlist',
          genre: '',
          releaseYear: '',
          rating: '',
          coverImageUrl: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding media:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/media/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          alert('Media deleted successfully! ✅');
          fetchMediaItems();
        } else {
          alert('Error deleting media');
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Error: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const totalItems = mediaItems.length;
  const completedItems = mediaItems.filter(item => item.status === 'Completed').length;
  const inProgressItems = mediaItems.filter(item => item.status === 'In Progress').length;
  const wishlistItems = mediaItems.filter(item => item.status === 'Wishlist').length;

  return (
    <div className="App">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Media Catalog</h1>
            <p>Track all your entertainment in one place</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {user && <p style={{ margin: '0', color: '#fff' }}>Welcome, <strong>{user.fullName}</strong>!</p>}
            <button
              onClick={handleLogout}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{totalItems}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedItems}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgressItems}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wishlist</div>
          <div className="stat-value">{wishlistItems}</div>
        </div>
      </div>

      <div className="filter-section">
        <label>Status:</label>
        <select className="filter-select">
          <option value="all">All</option>
          <option value="wishlist">Wishlist</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : '+ Add New Media Item'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Add New Media Item</h2>
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
                value={formData.genre}
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
                value={formData.releaseYear}
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
                value={formData.rating}
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
                value={formData.coverImageUrl}
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
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add your thoughts, reviews, or reminders..."
                rows="4"
              />
            </div>

            <button type="submit" className="submit-button">Add Media</button>
          </form>
        </div>
      )}

      <div className="media-grid">
        {mediaItems.length === 0 ? (
          <div className="empty-state">
            <h3>No media items yet</h3>
            <p>Start building your entertainment library by adding your first item</p>
          </div>
        ) : (
          mediaItems.map(item => (
            <div key={item.id} className="media-card">
              {item.coverImageUrl && (
                <img src={item.coverImageUrl} alt={item.title} className="media-image" />
              )}
              <div className="media-content">
                <h3>{item.title}</h3>
                <p><strong>Type:</strong> {item.type}</p>
                <p><strong>Status:</strong> {item.status}</p>
                {item.genre && <p><strong>Genre:</strong> {item.genre}</p>}
                {item.releaseYear && <p><strong>Year:</strong> {item.releaseYear}</p>}
                {item.rating && <p><strong>Rating:</strong> {item.rating}/10</p>}
                {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}

                <div className="button-container">
                  <Link to={`/edit-media/${item.id}`}>
                    <button className="edit-button">Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <p>Made with ❤️ in VS Code</p>
      </footer>
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/edit-media/:id" element={<ProtectedRoute><EditMedia /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
