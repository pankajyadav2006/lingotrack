const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json()); // Body parser

// Set up routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/translation', require('./src/routes/translationRoutes'));
app.use('/api/vocabulary', require('./src/routes/vocabularyRoutes'));
app.use('/api/progress', require('./src/routes/progressRoutes'));
app.use('/api/quiz', require('./src/routes/quizRoutes'));
app.use('/api/tts', require('./src/routes/ttsRoutes'));

// Ping route for connectivity test
app.get('/ping', (req, res) => res.send('pong'));

// Basic error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${PORT}`);
});
