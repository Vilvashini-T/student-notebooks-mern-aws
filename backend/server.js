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

app.use(cors());
// Security Middleware
const helmet = require('helmet');
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disabling CSP temporarily for easier dev flow with multiple ports
}));

// Rate Limiting (Fraud Detection & DDoS Prevention)
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Strict Rate Limiting for Auth/Payment routes
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // Limit each IP to 15 login/payment attempts per hour
    message: 'Too many sensitive requests from this IP, please try again after an hour'
});

// Middleware
app.use(express.json());

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
app.use('/api/users/login', strictLimiter);
app.use('/api/users/register', strictLimiter);
app.use('/api/users', userRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/flashsales', require('./routes/flashSaleRoutes'));

// Make uploads folder static
const __dirnameBase = path.resolve();
app.use('/uploads', express.static(path.join(__dirnameBase, '/uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Student Note Books API is running...');
});

// 404 & Error Treatment
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

