const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Path to data file
const dataFilePath = path.join(__dirname, 'media-data.json');

// Load data from file or create empty array
let mediaItems = [];
let nextId = 1;

// Load existing data
if (fs.existsSync(dataFilePath)) {
  const data = fs.readFileSync(dataFilePath, 'utf-8');
  const parsedData = JSON.parse(data);
  mediaItems = parsedData.items || [];
  nextId = parsedData.nextId || 1;
}

// Save data to file
function saveData() {
  const data = {
    items: mediaItems,
    nextId: nextId,
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// GET all media items
app.get('/api/media', (req, res) => {
  res.json(mediaItems);
});

// GET single media item by ID
app.get('/api/media/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = mediaItems.find(item => item.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// POST new media item
app.post('/api/media', (req, res) => {
  const newItem = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  mediaItems.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

// DELETE media item
app.delete('/api/media/:id', (req, res) => {
  const id = parseInt(req.params.id);
  mediaItems = mediaItems.filter(item => item.id !== id);
  saveData();
  res.status(204).send();
});

// UPDATE media item - PUT route for editing
app.put('/api/media/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mediaItems.findIndex(item => item.id === id);
  if (index !== -1) {
    mediaItems[index] = { ...mediaItems[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json(mediaItems[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const path = require('path');

// After your API routes...
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
