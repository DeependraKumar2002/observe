require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase payload limit for images
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inspection-observer';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Inspection Observer API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('📱 New client connected:', socket.id);

  // Handle user joining chat
  socket.on('join', (userData) => {
    console.log('👤 User joined chat:', userData);
    socket.userData = userData;
    socket.join(`user-${userData.email}-${userData.centerCode}`);

    // Notify others that a user joined
    socket.broadcast.emit('userJoined', userData);
  });

  // Handle sending message from user to admin
  socket.on('sendMessage', async (messageData) => {
    console.log('📧 Message sent:', messageData);

    try {
      // Save message to database
      const chatMessage = new ChatMessage({
        userEmail: messageData.userEmail,
        centerCode: messageData.centerCode,
        text: messageData.text,
        sender: 'user'
      });

      await chatMessage.save();
      console.log('📧 Message saved to database:', chatMessage._id);
    } catch (error) {
      console.error('Failed to save user message to database:', error);
    }

    // Broadcast to all admins or specific admin room
    io.emit('receiveMessage', messageData);
  });

  // Handle sending message from admin to user
  socket.on('sendAdminMessage', async (messageData) => {
    console.log('📢 Admin message sent:', messageData);

    try {
      // Save message to database
      const chatMessage = new ChatMessage({
        userEmail: messageData.userEmail,
        centerCode: messageData.centerCode,
        text: messageData.text,
        sender: 'admin'
      });

      await chatMessage.save();
      console.log('📢 Admin message saved to database:', chatMessage._id);
    } catch (error) {
      console.error('Failed to save admin message to database:', error);
    }

    // Send to specific user
    const room = `user-${messageData.userEmail}-${messageData.centerCode}`;
    io.to(room).emit('receiveAdminMessage', messageData);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('🚪 Client disconnected:', socket.id);
    if (socket.userData) {
      socket.broadcast.emit('userLeft', socket.userData);
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO available at ws://localhost:${PORT}`);
});

module.exports = app;