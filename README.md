# 📓 Student Note Books — MERN Web Application

> **This repository contains the web application source code** for "Student Note Books", a full-stack e-commerce platform for students to browse, order, and manage academic notebook products.

---

## 💡 What is this application?

Student Note Books is a fully functional MERN-stack e-commerce web app that includes:
- 📦 Product catalogue with categories and variations (Ruled / Unruled, sizes)
- 🛒 Cart and order management
- 🔐 User authentication with JWT (Login / Register)
- 👤 Admin dashboard to manage products, orders, and users
- 💳 Payment integration with Razorpay
- 📧 Email notifications via Nodemailer
- 🔒 Security features: rate limiting, helmet, bcrypt password hashing

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs |
| **File Uploads** | Cloudinary + Multer |
| **Process Manager** | PM2 (used in production deployment) |

---

## 📂 Project Structure

```
student-notebooks-mern-aws/
├── backend/
│   ├── config/         → Database connection setup
│   ├── controllers/    → Route handler logic (users, products, orders)
│   ├── middleware/     → Auth verification, error handling
│   ├── models/         → MongoDB/Mongoose data models
│   ├── routes/         → API route definitions
│   ├── utils/          → Helper utilities
│   ├── uploads/        → Local file upload directory
│   ├── server.js       → App entry point, Express configuration
│   ├── seeder.js       → Seeds database with initial sample data
│   └── .env.example    → Template showing all required environment variables
└── frontend/
    ├── public/         → Static assets
    ├── src/            → React components, pages, and hooks
    ├── index.html      → HTML entry point
    └── vite.config.js  → Vite build configuration
```

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

---

### Step 1 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:
```bash
copy .env.example .env
```

Edit `.env` and fill in your values (see `.env.example` for required fields).

Seed the database with sample products and an admin user:
```bash
node seeder.js
```

> 🔑 **Default login after seeding:**
> Email: `admin@studentnotebooks.com` | Password: `123456`

Start the backend server:
```bash
npm run dev     # Development (with auto-reload)
# or
node server.js  # Production style
```

Backend runs on: **http://localhost:5000**

---

### Step 2 — Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:
```
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## ☁️ Production Deployment (Automated via Terraform)

This app is designed to be deployed to AWS automatically using our companion Terraform repository. The Terraform script handles everything — no manual server setup needed.

👉 **Terraform Infrastructure Repo:** https://github.com/Vilvashini-T/devops_terraform

When deployed to AWS:
- Backend API runs on port **5000** managed by PM2
- Frontend is built for production and served on port **80** using the `serve` package
- MongoDB runs locally on the same EC2 server on port **27017**
