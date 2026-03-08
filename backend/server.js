const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Make uploads folder static
const __dirnameBase = path.resolve();
app.use('/uploads', express.static(path.join(__dirnameBase, '/uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Student Note Books API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
