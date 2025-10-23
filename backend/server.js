const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); // Import path once, here at the top

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Your API routes here (GET, POST, DELETE, PUT)...

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The catch-all handler: for any request that doesn't
// match an API route, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
