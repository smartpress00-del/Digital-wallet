app.use(express.json());
const errorHandler = require("./middleware/errorHandler");
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const loanRoutes = require('./routes/loan');

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/loan', loanRoutes);

app.use(errorHandler); // must come last

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const app = express();

// Existing imports
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

// ✅ Import loan routes
const loanRoutes = require('./routes/loan');

// Middleware
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/loan', loanRoutes); // ✅ mount loan routes

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

