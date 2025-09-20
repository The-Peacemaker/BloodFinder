# BloodFinder 🩸

A modern, responsive web application for connecting blood donors with emergency requests. Built with Node.js, Express, and MongoDB.

![BloodFinder](https://img.shields.io/badge/BloodFinder-Emergency%20Blood%20Finder-red?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 🌟 Features

### 👥 **For Donors**
- **Easy Registration**: Simple signup with blood group and location
- **Availability Management**: Update donation availability status
- **Emergency Alerts**: View and respond to urgent blood requests
- **Donation History**: Track your life-saving contributions

### 🏥 **For Recipients**
- **Smart Search**: Find donors by blood group and location
- **Emergency Requests**: Submit urgent blood requirements
- **Real-time Matching**: Connect with available donors instantly
- **Multi-city Support**: Extensive coverage across Indian cities

### 👨‍💼 **For Administrators**
- **Donor Management**: Approve/reject donor registrations
- **Emergency Monitoring**: Track active blood requests
- **Analytics Dashboard**: View platform statistics
- **Quality Control**: Ensure verified donor network

## 🚀 Quick Deployment

### Option 1: GitHub Pages + MongoDB Atlas (Recommended)

1. **Fork this repository**
2. **Setup MongoDB Atlas** (Free tier available)
   - Create account at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Get your connection string
3. **Deploy to GitHub Pages**
   - Enable GitHub Pages in repository settings
   - Your app will be live at `https://yourusername.github.io/Blood-Plasma-Donation-Emergency-Finder`

### Option 2: Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder)

### Option 3: Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder)

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder.git
cd Blood-Plasma-Donation-Emergency-Finder/BloodFinder

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if using local)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Run the application
npm start
# For development: npm run dev

# Seed sample data (optional)
npm run seed
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌐 Environment Configuration

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodfinder
JWT_SECRET=your_super_secure_secret_key
FRONTEND_URL=https://yourdomain.com
```

## 🏗️ Project Structure

```
BloodFinder/
├── 📄 server.js          # Express.js backend server
├── 🎨 index.html         # Landing page
├── 🩸 donor.html         # Donor dashboard
├── 🔍 search.html        # Search & emergency page
├── 👨‍💼 admin.html         # Admin panel
├── 💅 style.css          # Global styles (Tailwind CSS)
├── 🗃️ seed-data.js       # Sample data seeder
├── 📦 package.json       # Dependencies
├── 🔐 .env.example       # Environment template
└── 📖 README.md          # Documentation
```

## 🛡️ Security Features

- **🔐 JWT Authentication**: Secure token-based authentication
- **🔒 Password Hashing**: bcryptjs encryption
- **🛡️ CORS Protection**: Cross-origin request security
- **✅ Input Validation**: Server-side data validation
- **👥 Role-based Access**: Donor/Recipient/Admin permissions

## 🌍 Coverage

### 🇮🇳 **Indian Cities Supported**
- **Kerala**: Thiruvananthapuram, Kochi, Kozhikode, Thrissur, Kollam, Alappuzha, Palakkad, Kannur, Kottayam, Malappuram, and more
- **Metro Cities**: Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad
- **Tier-2 Cities**: Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal, Visakhapatnam, Patna, and 100+ more

## 📱 API Documentation

### Authentication
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
```

### Donor Operations
```http
GET  /api/donor/search     # Search donors
PUT  /api/donor/profile    # Update donor profile
PUT  /api/donor/availability # Toggle availability
```

### Emergency Management
```http
POST /api/emergency/create    # Create emergency request
GET  /api/emergency/active    # Get active emergencies
POST /api/emergency/respond   # Respond to emergency
```

### Admin Operations
```http
GET  /api/admin/stats        # Dashboard statistics
PUT  /api/admin/approve/:id  # Approve donor
GET  /api/admin/users        # Manage users
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'donor' | 'recipient' | 'admin',
  bloodGroup: String,
  city: String,
  age: Number,
  address: String,
  isAvailable: Boolean,
  isApproved: Boolean,
  totalDonations: Number,
  lastDonation: Date,
  createdAt: Date
}
```

### Emergency Requests Collection
```javascript
{
  patientName: String,
  bloodGroup: String,
  unitsNeeded: Number,
  hospital: String,
  contactNumber: String,
  urgency: 'critical' | 'high' | 'medium',
  city: String,
  address: String,
  additionalNotes: String,
  status: 'active' | 'fulfilled' | 'cancelled',
  responses: [{ donor: ObjectId, respondedAt: Date }],
  createdAt: Date
}
```

## 🔧 Deployment Platforms

| Platform | Best For | Setup Difficulty | Cost |
|----------|----------|------------------|------|
| **Vercel** | Static sites + serverless | ⭐⭐ | Free tier |
| **Railway** | Full-stack apps | ⭐⭐⭐ | Free tier |
| **Heroku** | Traditional hosting | ⭐⭐⭐⭐ | Free tier ending |
| **DigitalOcean** | Custom deployment | ⭐⭐⭐⭐⭐ | $5/month |

## 🚨 Emergency Features

- **🚨 Critical Priority**: Immediate notifications
- **📱 Mobile Responsive**: Works on all devices  
- **🔍 Smart Matching**: Location-based donor search
- **⚡ Real-time Updates**: Live emergency status
- **📞 Direct Contact**: Connect donors with hospitals

## 📄 License

MIT License - This project is open source and available under the [MIT License](LICENSE).


## 🆘 Support & Issues

- 🐛 **Bug Reports**: [Create an issue](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/discussions)
- 📧 **Contact**: Create an issue for support

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder&type=Date)](https://star-history.com/#The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder&Date)

---

**💝 Built with love to save lives through technology**


**🚀 Ready to deploy? Click the deploy buttons above!**
