app.use(express.json());
const errorHandler = require("./middleware/errorHandler");
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const loanRoutes = require('./routes/loan');

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/loan', loanRoutes);
const PORT = process.env.PORT || 5000;

app.listen(5000, () => console.log("Server running on port 5000"));
app.use(errorHandler); // must come last
