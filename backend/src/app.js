//backend/src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./db/mongoose');
const User = require('./models/UserModel');
const Company = require('./models/CompanyModel');
const InviteToken = require('./models/InviteTokenModel');

const authRoutes = require('./routes/authRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const jobRoutes = require('./routes/jobRoutes');

const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(cors());
app.use(cors({
  // Specify the allowed origin instead of using wildcard '*'
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/jobs', jobRoutes);
console.log("In app.js");

app.get('/', (req, res) => {
  res.send("Welcome to the CharityEase API!");
});

module.exports = app;
