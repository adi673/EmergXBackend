// backend/src/app.js

const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/mongoose');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

// ✅ Create logs directory if not exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// ✅ HTTP request logging (to file)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
const combinedLogStream = fs.createWriteStream(path.join(logDir, 'combined.log'), { flags: 'a' });

// Simple access log (common format)
app.use(morgan('common', { stream: accessLogStream }));

// Detailed combined log (combined format)
app.use(morgan('combined', { stream: combinedLogStream }));

// ✅ HTTP request logging (to console)
app.use(morgan('dev'));

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/jobs', jobRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.send("Welcome to the CharityEase API!");
});

// ✅ Error handler (should come after routes)
app.use(errorHandler);

module.exports = app;
