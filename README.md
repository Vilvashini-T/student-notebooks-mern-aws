# 📓 Student Note Books - MERN Application

A full-stack application built for students to organize, manage, and track their daily notes and academic progress.

This repository holds the application source code, while the infrastructure is managed entirely via our companion Terraform repository.

## 🛠️ Technology Stack

- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Process Manager:** PM2 (for production deployment)

## 📂 Project Structure

- `/frontend`: Contains the Vite-based React application.
- `/backend`: Contains the Express API and MongoDB Mongoose models.

## 🚀 Local Development Setup

### 1. Backend Setup

1. Open a terminal in the `backend` folder.
2. Install dependencies: `npm install`
3. Create a `.env` file and add your MongoDB connection string and port.
4. (Optional) Run the database seeder: `node seeder.js`
5. Start the development server: `npm run dev` or `node server.js`

### 2. Frontend Setup

1. Open a terminal in the `frontend` folder.
2. Install dependencies: `npm install`
3. Create a `.env` file and add: `VITE_API_BASE_URL=http://localhost:5000`
4. Start the frontend: `npm run dev`

## ☁️ Production Deployment

This app is designed to be deployed using our Terraform automated script. When deployed to AWS:

1. The backend runs on port 5000 via PM2.
2. The frontend is built (`npm run build`) and served on port 80 via the `serve` package.
