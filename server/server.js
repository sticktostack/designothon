require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/teams', require('./routes/teams'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Design O Thon API is running 🎨', timestamp: new Date() });
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/registration.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../client/admin.html')));
app.get('/scoring', (req, res) => res.sendFile(path.join(__dirname, '../client/scoring.html')));
app.get('/projection', (req, res) => res.sendFile(path.join(__dirname, '../client/projection.html')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/design-o-thon')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📋 Admin Panel: http://localhost:${PORT}/admin.html`);
      console.log(`📝 Registration: http://localhost:${PORT}/registration.html`);
      console.log(`📊 Projection: http://localhost:${PORT}/projection.html`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

