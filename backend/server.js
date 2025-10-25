const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import authentication routes and middleware
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to data file
const dataFilePath = path.join(__dirname, 'media-data.json');

// Load data from file or create empty array
let mediaItems = [];
let nextId = 1;

// Load existing data
if (fs.existsSync(dataFilePath)) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    mediaItems = parsedData.items || [];
    nextId = parsedData.nextId || 1;
    console.log(`✅ Loaded ${mediaItems.length} media items from file`);
  } catch (error) {
    console.error('❌ Error loading data file:', error);
  }
}

// Save data to file
function saveData() {
  try {
    const data = {
      items: mediaItems,
      nextId: nextId,
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log('💾 Data saved to file');
  } catch (error) {
    console.error('❌ Error saving data:', error);
  }
}

// ========================================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// ========================================

// 1. ROOT ROUTE - Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Media Catalog API is running!',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth (POST /register, POST /login)',
      media: '/api/media (requires authentication)',
      test: '/api/test'
    },
    documentation: 'Protected routes require JWT token in Authorization header',
    timestamp: new Date().toISOString()
  });
});

// 2. TEST ROUTE
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend is working!', 
    totalMediaItems: mediaItems.length,
    timestamp: new Date().toISOString()
  });
});

// 3. AUTHENTICATION ROUTES
app.use('/api/auth', authRoutes);

// ========================================
// PROTECTED ROUTES (AUTH REQUIRED)
// ========================================

// GET all media items
app.get('/api/media', authMiddleware, (req, res) => {
  try {
    console.log('📥 GET /api/media - User:', req.user.email);
    console.log('📦 Returning', mediaItems.length, 'items');
    res.json(mediaItems);
  } catch (error) {
    console.error('❌ Error in GET /api/media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// GET single media item by ID
app.get('/api/media/:id', authMiddleware, (req, res) => {
  try {
    console.log('📥 GET /api/media/:id - User:', req.user.email);
    const id = parseInt(req.params.id);
    console.log('🔍 Looking for media item with ID:', id);
    console.log('📦 Available items:', mediaItems.map(i => ({ id: i.id, title: i.title })));
    
    const item = mediaItems.find(item => item.id === id);
    
    if (item) {
      console.log('✅ Found item:', item.title);
      res.json(item);
    } else {
      console.log('❌ Item not found with ID:', id);
      res.status(404).json({ 
        success: false,
        error: 'Item not found',
        searchedId: id,
        availableIds: mediaItems.map(i => i.id)
      });
    }
  } catch (error) {
    console.error('❌ Error in GET /api/media/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// POST new media item
app.post('/api/media', authMiddleware, (req, res) => {
  try {
    console.log('📥 POST /api/media - User:', req.user.email);
    console.log('📦 Body:', req.body);
    
    const newItem = {
      id: nextId++,
      ...req.body,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
    };
    
    mediaItems.push(newItem);
    saveData();
    
    console.log('✅ Media added successfully. Total items:', mediaItems.length);
    console.log('📝 New item:', { id: newItem.id, title: newItem.title });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('❌ Error in POST /api/media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// PUT update media item
app.put('/api/media/:id', authMiddleware, (req, res) => {
  try {
    console.log('📥 PUT /api/media/:id - User:', req.user.email);
    const id = parseInt(req.params.id);
    console.log('✏️ Updating media item with ID:', id);
    console.log('📦 Update data:', req.body);
    
    const index = mediaItems.findIndex(item => item.id === id);
    
    if (index !== -1) {
      mediaItems[index] = { 
        ...mediaItems[index], 
        ...req.body, 
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.email
      };
      saveData();
      console.log('✅ Media updated:', mediaItems[index].title);
      res.json(mediaItems[index]);
    } else {
      console.log('❌ Item not found with ID:', id);
      res.status(404).json({ 
        success: false,
        error: 'Item not found' 
      });
    }
  } catch (error) {
    console.error('❌ Error in PUT /api/media/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// DELETE media item
app.delete('/api/media/:id', authMiddleware, (req, res) => {
  try {
    console.log('📥 DELETE /api/media/:id - User:', req.user.email);
    const id = parseInt(req.params.id);
    console.log('🗑️ Deleting media item with ID:', id);
    
    const initialLength = mediaItems.length;
    mediaItems = mediaItems.filter(item => item.id !== id);
    
    if (mediaItems.length < initialLength) {
      saveData();
      console.log('✅ Media deleted. Total items:', mediaItems.length);
      res.status(200).json({ 
        success: true,
        message: 'Deleted successfully' 
      });
    } else {
      console.log('❌ Item not found with ID:', id);
      res.status(404).json({ 
        success: false,
        error: 'Item not found' 
      });
    }
  } catch (error) {
    console.error('❌ Error in DELETE /api/media/:id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// ========================================
// ERROR HANDLERS (MUST BE LAST!)
// ========================================

// 404 handler - catches all undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/media (protected)',
      'POST /api/media (protected)',
      'GET /api/media/:id (protected)',
      'PUT /api/media/:id (protected)',
      'DELETE /api/media/:id (protected)'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// ========================================
// START SERVER
// ========================================
app.listen(port, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('✅ SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`📡 API: http://localhost:${port}/api`);
  console.log(`📦 Media items: ${mediaItems.length}`);
  console.log(`🔐 Auth: JWT Enabled`);
  console.log(`💾 Storage: ${dataFilePath}`);
  console.log('='.repeat(50));
  console.log('');
});
