# Student Note Books - Enterprise E-commerce Platform

A professional, high-performance e-commerce platform specially optimized for stationary and educational supply shops. Built with a focus on ease of management, premium user experience, and robust business tools.

---

## ✨ Premium Features (Beyond Flipkart Standards)

### 📈 Advanced Business Intelligence
- **Real-time Sales Analytics**: Interactive dashboard with daily revenue charts.
- **Top Product Performance**: Visual breakdown of your best-selling items.
- **Low Stock Intelligence**: Automatic email alerts when inventory drops below threshold.

### ⚡ Operational Excellence
- **Bulk Inventory Management**: Import hundreds of products instantly using the Smart JSON Import tool.
- **Professional Invoicing**: Automated PDF invoice generation for every order with GST breakdowns.
- **Dynamic Variates**: Manage products with multiple sizes, rulings, and colors efficiently.

### 🛍️ User Experience (Flipkart-Style)
- **Smart Suggestions**: Intent-based search suggestions.
- **Wishlist & Buy Now**: One-click add to wishlist and express checkout flow.
- **Visual Order Tracking**: Interactive stepper for tracking confirmed, shipped, and delivered states.
- **Coupon System**: Advanced discount management with usage limits and expiry.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Lucide React, React Hot Toast (Notifications), CSS3 Modern Variables.
- **Backend**: Node.js & Express.js (High-concurrency architecture).
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT Authentication, Bcrypt Password Hashing, Helmet Security Headers, Rate Limiting.
- **Integrations**: Razorpay (Payments), Nodemailer (Email Alerts), PDFKit (Invoicing).

---

## 🚀 Deployment Guide

### Backend Configuration
1. Navigate to `/backend`.
2. Create a `.env` file with these keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_cluster_url
   JWT_SECRET=your_secure_random_string
   RAZORPAY_KEY_ID=your_razorpay_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   SMTP_USER=your_email_server_username
   SMTP_PASS=your_email_server_password
   ADMIN_EMAIL=shopkeeper@example.com
   ```
3. Run `npm install` and `npm start`.

### Frontend Configuration
1. Navigate to `/frontend`.
2. Create a `.env` file:
   ```env
   VITE_API_BASE_URL=https://your-production-api-url.com
   ```
3. Run `npm install` and `npm run build`.

---

## 🔐 Credentials (Default Seed)
- **Admin**: `admin@studentnotebooks.com` / `123456`
- **Customer**: `john@example.com` / `123456`

---

## 📄 Business Value
This platform is ready to be sold to any stationary shop. It provides the same professional feel as major retail apps while offering the shopkeeper powerful tools like bulk import and low-stock alerts that save hours of manual work.
