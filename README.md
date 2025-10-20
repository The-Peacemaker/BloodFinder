# 🩸 BloodFinder - Blood & Plasma Donation Emergency Finder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

> A comprehensive blood donation management platform connecting donors with emergency requests, featuring real-time analytics, public feedback, and inventory management.

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**BloodFinder** is a full-stack web application designed to bridge the gap between blood donors and recipients during emergencies. Built with Node.js, Express, and MongoDB, it provides a comprehensive platform for blood donation management.

### 🎯 Key Metrics

- **6 Database Tables** with proper relationships
- **577+ Sample Records** for realistic demo
- **12 Hospitals** with complete blood inventory
- **41 Active Donors** across 15+ cities in India
- **311 Donation Records** tracked over 6 months
- **5 Interactive Charts** for analytics

---

## ✨ Features

### 👥 For Donors
- ✅ Easy registration with blood group & availability status
- 📊 Personal donation history tracking with certificate management
- 🏆 Digital certificates for each donation
- ⏰ Eligibility date tracking (90-day interval between donations)
- 💬 Submit donations with hospital details
- 🔔 Real-time emergency notifications

### 🆘 For Recipients
- 🔍 Advanced donor search by blood group and location
- 🚨 Create emergency blood requests with urgency levels (critical/high/medium)
- 📞 Direct access to donor contact information
- 🏥 Hospital-wise blood inventory checking
- 💬 Public feedback submission (no login required)

### 👨‍💼 For Administrators
- 📈 **Advanced Analytics Dashboard** with Chart.js
  - Blood group distribution (Doughnut Chart)
  - City-wise donor distribution (Bar Chart)
  - Donations over time - Last 6 months (Line Chart)
  - Donation types breakdown (Pie Chart)
  - Blood inventory status (Dual-axis Bar Chart)
- 👥 Complete donor management & approval system
- 🚨 Emergency request tracking & resolution
- 🏥 Blood inventory management (Add/Update/Monitor)
- 💬 Feedback review system with public submissions
- 📋 Comprehensive donation history access
- 📊 Real-time statistics (donors, donations, emergencies, lives saved)

---

## 🗄️ Database Schema

### 6 Interconnected Tables

#### 1. **Users Table** 👥
```javascript
{
  firstName, lastName, email, password,
  role: ['donor', 'recipient', 'admin'],
  bloodGroup, city, address, phone, age,
  isAvailable, isApproved, totalDonations,
  lastDonation, createdAt
}
```

#### 2. **Emergency Requests Table** 🚨
```javascript
{
  patientName, bloodGroup, hospital,
  contactNumber, urgencyLevel: ['critical', 'high', 'medium'],
  city, additionalNotes,
  status: ['active', 'resolved', 'cancelled'],
  responses: [{ donor, respondedAt }],
  createdAt
}
```

#### 3. **Feedback Table** 💬
```javascript
{
  user, userEmail, 
  feedbackType: ['app', 'donor'],
  donor, rating (1-5), comment, category,
  status: ['pending', 'reviewed', 'resolved'],
  isPublicSubmission, createdAt
}
```

#### 4. **Donation History Table** 🩸
```javascript
{
  donor, donorName, bloodGroup, donationDate,
  hospital, city,
  donationType: ['whole-blood', 'plasma', 'platelets', 'red-cells'],
  quantity, certificate, recipientName,
  notes, createdAt
}
```

#### 5. **Blood Inventory Table** 🏥
```javascript
{
  bloodGroup, hospital, city, contactNumber,
  quantity, unitsAvailable,
  status: ['available', 'low', 'critical'],
  expiryDate, lastUpdated, notes
}
```

#### 6. **Notifications Table** 🔔
```javascript
{
  recipient, type, title, message,
  priority: ['low', 'medium', 'high', 'critical'],
  isRead, createdAt
}
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Bcryptjs for password hashing

### Frontend
- **HTML5** with semantic markup
- **Tailwind CSS** for responsive design
- **Vanilla JavaScript** for interactivity
- **Chart.js** for data visualizations

### DevOps
- **Version Control:** Git
- **Package Manager:** npm
- **Environment:** dotenv for configuration

---

## 🚀 Installation

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm (v8.0.0 or higher)

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/BloodFinder.git
cd BloodFinder
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/bloodfinder
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
NODE_ENV=development
```

4. **Seed the database** (Optional - for demo/testing)
```bash
npm run seed-complete
```

This will populate:
- 1 Admin account
- 41 Donors with diverse blood groups
- 12 Active emergency requests
- 20 Feedback entries (17 public)
- 311 Donation records
- 96 Blood inventory records (12 hospitals)
- 87 Notifications

5. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. **Access the application**

Open your browser and navigate to:
- **Main Site:** `http://localhost:3001`
- **Admin Panel:** `http://localhost:3001/admin.html`
- **Donor Portal:** `http://localhost:3001/donor.html`
- **Search Donors:** `http://localhost:3001/search.html`

---

## 💻 Usage

### Quick Start Guide

1. **Admin Access:**
   - Go to `/admin.html`
   - Login with: `admin@bloodfinder.com` / `admin123`
   - Explore analytics, manage donors, emergencies, inventory

2. **Donor Registration:**
   - Go to `/donor.html`
   - Click "Register" and fill the form
   - Login and manage your profile

3. **Search for Donors:**
   - Go to `/search.html`
   - Select blood group and city
   - View available donors

4. **Submit Public Feedback:**
   - Go to `/public-feedback.html`
   - No login required!
   - Rate app or specific donors

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/profile         - Get user profile (JWT)
```

### Donors
```
GET    /api/donors/search        - Search donors by blood group/city
GET    /api/donors/available     - Get all available donors
PUT    /api/donors/availability  - Toggle donor availability (JWT)
```

### Emergency Requests
```
POST   /api/emergency/create     - Create emergency request
GET    /api/emergency/active     - Get active emergencies
PUT    /api/emergency/:id/resolve - Resolve emergency (Admin JWT)
```

### Donations
```
POST   /api/donation/submit      - Submit donation (Donor JWT)
GET    /api/donation/my-donations - Get donor's donations (JWT)
GET    /api/donation/all         - Get all donations (Admin JWT)
```

### Feedback
```
POST   /api/feedback/public-submit - Submit public feedback (No auth)
POST   /api/feedback/submit       - Submit feedback (JWT)
GET    /api/feedback/all          - Get all feedback (Admin JWT)
GET    /api/feedback/donors-list  - Get public donor list
```

### Blood Inventory
```
GET    /api/inventory/search     - Search inventory (public)
POST   /api/inventory/add        - Add inventory (Admin JWT)
PUT    /api/inventory/:id/update - Update inventory (Admin JWT)
GET    /api/inventory/alerts     - Get critical/low alerts (Admin JWT)
```

### Analytics
```
GET    /api/analytics/dashboard  - Get comprehensive analytics (Admin JWT)
```

### Admin
```
GET    /api/admin/stats          - Get statistics
GET    /api/admin/donors         - Get all donors
GET    /api/admin/emergency-requests - Get all emergencies
PUT    /api/admin/donors/:id/status - Update donor status
```

---

## 🔑 Demo Credentials

### Admin Account
```
Email:    admin@bloodfinder.com
Password: admin123
```

### Sample Donor Accounts (All use password: `donor123`)
```
arjun.nair@email.com    - O+ Blood Group - Thiruvananthapuram
priya.menon@email.com   - A+ Blood Group - Kochi
rahul.pillai@email.com  - B+ Blood Group - Kozhikode
anjali.k@email.com      - AB+ Blood Group - Thrissur
vivek.sharma@email.com  - O- Blood Group - Mumbai
```

---

## 📁 Project Structure

```
BloodFinder/
├── server.js                 # Main Express server
├── package.json              # Dependencies & scripts
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── vercel.json               # Vercel deployment config
│
├── seed-complete.js          # Complete database seeding script
├── seed-data.js              # Basic seeding script
│
├── index.html                # Landing page
├── admin.html                # Admin dashboard (Analytics, Management)
├── donor.html                # Donor portal
├── search.html               # Public donor search
├── public-feedback.html      # Public feedback (no login)
├── style.css                 # Custom styles
│
└── README.md                 # This file
```

---

## 📊 Database Statistics

After running `npm run seed-complete`:

```
Total Records: 577

├── Users:            42 (1 Admin + 41 Donors)
├── Emergencies:      12 (All active with different priorities)
├── Feedback:         20 (17 public + 3 authenticated)
├── Donations:       311 (Spread over 6 months)
├── Inventory:        96 (12 hospitals × 8 blood groups)
└── Notifications:    87 (Various types and priorities)
```

---

## 🎯 DBMS Concepts Demonstrated

This project showcases comprehensive database management concepts:

1. **Database Design:**
   - 6 normalized tables with proper relationships
   - Foreign key references
   - Data integrity constraints

2. **CRUD Operations:**
   - Complete Create, Read, Update, Delete functionality
   - Complex queries with filters and aggregations

3. **Advanced Queries:**
   - MongoDB aggregation pipelines
   - Grouping and sorting
   - Date range queries
   - Multi-field filtering

4. **Security:**
   - Password hashing (bcrypt)
   - JWT authentication
   - Role-based access control

5. **Data Relationships:**
   - One-to-Many (User → Donations)
   - Many-to-One (Feedback → User)
   - Reference-based relationships


## 📝 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server (nodemon)
npm run seed           # Seed basic data
npm run seed-complete  # Seed complete database with 577+ records
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If not installed locally, use MongoDB Atlas
# Update MONGODB_URI in .env with Atlas connection string
```

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3001 | xargs kill -9
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## ⭐ Show Your Support

Give a ⭐️ if this project helped you!


**Built With ❤️ By Benedict**
