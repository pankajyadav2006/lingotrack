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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    callback(new Error('Not allowed by CORS'));
  },
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
