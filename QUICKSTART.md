# 🚀 Quick Start Guide

## Prerequisites
- Node.js v16+
- MongoDB running locally or Atlas connection

## Setup (3 Steps)

### 1. Install
```bash
npm install
```

### 2. Configure
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/bloodfinder
JWT_SECRET=your_secret_key_here
PORT=3001
```

### 3. Seed & Start
```bash
npm run seed
npm start
```

## Access
- **Admin Panel:** http://localhost:3001/admin.html
- **Donor Portal:** http://localhost:3001/donor.html
- **Public Search:** http://localhost:3001/search.html

## Default Credentials
**Admin:** admin@bloodfinder.com / admin123  
**Donor:** arjun.nair@email.com / donor123

## Key Features
✅ 6 Database Tables (577+ records)  
✅ Analytics Dashboard with Charts  
✅ Public Feedback System  
✅ Blood Inventory Management  
✅ Donation Tracking  

## Commands
```bash
npm start      # Start server
npm run dev    # Dev mode with nodemon
npm run seed   # Populate database
```

## Tech Stack
Node.js | Express | MongoDB | JWT | Chart.js | Tailwind CSS

---

**🩸 Built to Save Lives**
