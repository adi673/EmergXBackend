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
const authCandidateRoutes = require('./routes/candidateRoutes/authCandidate');
// const authAdminRoutes = require('./routes/adminRoutes/authAdmin');
const postJobRoutes = require('./routes/adminRoutes/postJobsRoutes');

const candidateJobRoutes = require('./routes/candidateRoutes/JobRoutes');
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
// app.use(cors({
//   origin: 'http://localhost:3003',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));
app.use(cors({
  origin: true, // Reflects request origin
  credentials: true,
}));


// ✅ Routes
//company Routes
app.use('/api/auth', authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/jobs', jobRoutes);

//candidate Routes
app.use('/api/auth/candidate', authCandidateRoutes);
app.use('/api/candidate/jobs', candidateJobRoutes);

//Admin Routes
// app.use('/api/admin',authAdminRoutes)
app.use('/api/admin/jobs', postJobRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.send("Welcome to the CharityEase API!");
});

// ✅ Error handler (should come after routes)
app.use(errorHandler);

module.exports = app;
