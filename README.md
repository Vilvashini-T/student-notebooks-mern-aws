# Student Note Books - E-commerce Platform

A professional, full-stack e-commerce platform designed for educational supplies, inspired by the UI/UX of industry leaders like Flipkart and BigBasket.

## 🚀 Key Features

- **Premium UI/UX**: Pastel-themed design with modern micro-interactions and high-resolution visuals.
- **Smart Search**: Flipkart-style search suggestions for common stationery items.
- **Advanced Filtering**: Sidebar with Price Range, Brand, and Category filters.
- **Visual Order Tracking**: Flipkart-inspired horizontal stepper to track order progress (Confirmed -> Packed -> Shipped -> Delivered).
- **Admin Dashboard**: Full inventory management for the shopkeeper to add/edit products, manage stock variations, and update order statuses.
- **Role-Based Access**: Secure Admin and Customer roles with JWT authentication.
- **Responsive Checkout**: Multi-step checkout flow including address management and payment simulation.

## 🛠️ Tech Stack

- **Frontend**: React.js, Lucide React (Icons), CSS3 (Modern Flex/Grid), Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT (Json Web Tokens), Bcrypt.js password hashing.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas or local MongoDB instance

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd student-note-books
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Seed Data (Optional - To get started with a template)
```bash
cd ../backend
npm run data:import
```

### 5. Run the Application
**Backend:**
```bash
cd backend
npm start
```
**Frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Credentials (for seeded data)
- **Admin**: `admin@studentnotebooks.com` / `123456`
- **Customer**: `john@example.com` / `123456`

## 📄 License
MIT
