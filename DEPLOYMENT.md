# 🚀 BloodFinder Deployment Guide

This guide will help you deploy BloodFinder to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All development files removed
- [ ] Environment variables configured
- [ ] MongoDB Atlas account ready (recommended)
- [ ] GitHub repository created
- [ ] .env file created from .env.example

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for beginners)

1. **Setup MongoDB Atlas**
   - Create account at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster (free tier available)
   - Create database user with read/write access
   - Get connection string

2. **Deploy to Vercel**
   - Push code to GitHub
   - Connect GitHub account to [Vercel](https://vercel.com)
   - Import your repository
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bloodfinder
     JWT_SECRET=your_secure_secret_key
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Deploy!

### Option 2: Railway

1. **Setup Database**
   - Create MongoDB Atlas account (same as above)

2. **Deploy to Railway**
   - Connect GitHub to [Railway](https://railway.app)
   - Select your repository
   - Add environment variables in Railway dashboard
   - Deploy automatically

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI first
   heroku login
   ```

2. **Deploy**
   ```bash
   # Create Heroku app
   heroku create your-bloodfinder-app
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set FRONTEND_URL=https://your-app.herokuapp.com
   
   # Deploy
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Connect Repository**
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub

2. **Configure**
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables
   - Deploy

## 🗃️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Sign up at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new project
   - Build a cluster (choose free tier)

2. **Configure Access**
   - Database Access: Create database user
   - Network Access: Allow access from anywhere (0.0.0.0/0)

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

4. **Update Environment**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloodfinder?retryWrites=true&w=majority
   ```

## 🔑 Environment Variables

Required for all deployments:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_secret_key_min_32_chars
FRONTEND_URL=https://your-deployed-app-url.com
```

## 📦 Initial Data Setup

After deployment, seed your database with sample data:

1. **Using the web interface** (if deployed):
   - Visit: `https://your-app.com/seed-data`
   - Or use the admin panel to add data

2. **Using the seed script** (if you have terminal access):
   ```bash
   npm run seed
   ```

3. **Manual setup**:
   - Create admin account through registration
   - Approve donors through admin panel
   - Add emergency requests

## 🧪 Testing Your Deployment

1. **Check Basic Functionality**
   - [ ] Homepage loads correctly
   - [ ] Registration works
   - [ ] Login works
   - [ ] Search works
   - [ ] Admin panel accessible

2. **Test Core Features**
   - [ ] Donor registration and approval
   - [ ] Emergency request creation
   - [ ] Donor search (including ALL blood groups)
   - [ ] Admin dashboard statistics

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify connection string is correct
- Check database user credentials
- Ensure network access allows your hosting platform

**Environment Variables Not Working**
- Verify all required variables are set
- Check for typos in variable names
- Restart the application after adding variables

**CORS Errors**
- Update `FRONTEND_URL` to match your deployed URL
- Ensure CORS is properly configured in server.js

**Build Failures**
- Check Node.js version compatibility (requires 16+)
- Verify all dependencies in package.json
- Review build logs for specific errors

## 📊 Monitoring & Maintenance

### Performance Monitoring
- Use your hosting platform's analytics
- Monitor MongoDB Atlas metrics
- Set up error tracking (optional)

### Regular Maintenance
- Keep dependencies updated
- Monitor database storage usage
- Backup database regularly (MongoDB Atlas does this automatically)

## 🚨 Security Considerations

### Production Security
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use HTTPS only
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

### Environment Security
- [ ] Never commit .env files
- [ ] Use different secrets for production
- [ ] Rotate JWT secrets periodically
- [ ] Enable database audit logs

## 📞 Support

If you encounter issues:
1. Check this deployment guide
2. Review the main README.md
3. Check hosting platform documentation
4. Create an issue on GitHub

---

**🎉 Congratulations! Your BloodFinder app should now be live and helping save lives!**