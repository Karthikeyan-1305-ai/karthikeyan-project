import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mediaItems, setMediaItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  // Fetch media items from backend
  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media');
      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      await fetch(`api/media/${id}`, {
        method: 'DELETE'
      });
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  // Calculate statistics
  const totalItems = mediaItems.length;
  const completedItems = mediaItems.filter(item => item.status === 'Completed').length;
  const inProgressItems = mediaItems.filter(item => item.status === 'In Progress').length;
  const wishlistItems = mediaItems.filter(item => item.status === 'Wishlist').length;

  return (
    <div className="App">
      <header className="header">
        <h1>Media Catalog</h1>
        <p>Track all your entertainment in one place</p>
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
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="Movie">Movie</option>
                <option value="TV Show">TV Show</option>
                <option value="Book">Book</option>
                <option value="Music">Music</option>
                <option value="Game">Game</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Wishlist">Wishlist</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Release Year</label>
              <input
                type="text"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Rating (0-10)</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="10"
                value={formData.rating}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Cover Image URL</label>
              <input
                type="text"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add your thoughts..."
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
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <p>Made in VS Code</p>
      </footer>
    </div>
  );
}

export default App;
