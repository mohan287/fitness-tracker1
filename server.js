require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const net = require('net');
const colors = require('colors'); // for pretty console colors

const authRoutes = require('./routes/auth');
const gymRoutes = require('./routes/gyms');
const memberRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');
const staffRoutes = require('./routes/staff');
const miscRoutes = require('./routes/misc');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/misc', miscRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitness_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!'.green.bold);

    const defaultPort = process.env.PORT || 5000;

    // Function to find a free port automatically
    function findAvailablePort(startPort, callback) {
      const server = net.createServer();
      server.unref();
      server.on('error', () => findAvailablePort(startPort + 1, callback));
      server.listen(startPort, () => {
        const { port } = server.address();
        server.close(() => callback(port));
      });
    }

    // Start server on free port
    findAvailablePort(defaultPort, (port) => {
      app.listen(port, () => {
        console.log(`🚀 Server is running at:`.cyan.bold);
        console.log(`👉 http://localhost:${port}/public/login.html`.brightGreen.underline);
      });
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:'.red, err.message);
  });
