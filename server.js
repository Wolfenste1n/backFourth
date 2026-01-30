const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080; 

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics_db');
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

const measurementRoutes = require('./routes/measurements');
app.use('/api/measurements', measurementRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/measurements`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port:`);
    console.log('1. Kill the existing process:');
    console.log(`   lsof -ti:${PORT} | xargs kill -9`);
    console.log(`2. Or change the port in server.js to something else (e.g., 5050, 6000, 8000)`);
    console.log(`3. Or set a different port via environment variable:`);
    console.log(`   PORT=6000 npm run dev`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});