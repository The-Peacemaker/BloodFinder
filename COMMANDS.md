# BloodFinder - Essential Commands Guide 🚀

This document contains all the essential commands needed to run, manage, and troubleshoot the BloodFinder application.

## 📋 Table of Contents
- [Quick Setup Commands](#quick-setup-commands)
- [Database Commands](#database-commands)
- [Application Commands](#application-commands)
- [Development Commands](#development-commands)
- [Troubleshooting Commands](#troubleshooting-commands)
- [Deployment Commands](#deployment-commands)

---

## 🚀 Quick Setup Commands

### Initial Setup (Run Once)
```bash
# Clone the repository
git clone https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder.git

# Navigate to project directory
cd BloodFinder

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit environment variables (Windows)
notepad .env
```

### Start Everything (Daily Use)
```bash
# Start MongoDB service
net start MongoDB

# Start the application
npm start

# Or start in development mode
npm run dev
```

---

## 🗄️ Database Commands

### MongoDB Service Management (Windows)
```bash
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Check MongoDB service status
sc query MongoDB

# Restart MongoDB service
net stop MongoDB && net start MongoDB
```

### Manual MongoDB Start (Alternative)
```bash
# Create data directory (first time only)
mkdir C:\data\db

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"

# Start MongoDB with custom port
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --port 27018 --dbpath "C:\data\db"
```

### MongoDB Shell Operations
```bash
# Connect to MongoDB shell
mongo

# Connect to specific database
mongo bloodfinder

# Connect with authentication
mongo -u username -p password bloodfinder
```

### Database Management
```bash
# Switch to bloodfinder database
use bloodfinder

# Show all databases
show dbs

# Show all collections
show collections

# View users collection
db.users.find().pretty()

# View emergency requests
db.emergencyrequests.find().pretty()

# Count documents
db.users.count()
db.emergencyrequests.count()

# Drop specific collection
db.users.drop()
db.emergencyrequests.drop()

# Drop entire database
db.dropDatabase()
```

### Database Backup & Restore
```bash
# Backup entire database
mongodump --db bloodfinder --out backup/

# Backup with date
mongodump --db bloodfinder --out backup/bloodfinder_%date:~-4,4%%date:~-10,2%%date:~-7,2%

# Restore database
mongorestore --db bloodfinder backup/bloodfinder/

# Restore and drop existing data
mongorestore --db bloodfinder --drop backup/bloodfinder/
```

---

## 🖥️ Application Commands

### Basic Application Operations
```bash
# Install all dependencies
npm install

# Start the server (production mode)
npm start

# Start in development mode (auto-restart)
npm run dev

# Seed sample data
npm run seed

# Check package vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Environment Management
```bash
# Copy environment template
copy .env.example .env

# Edit environment file
notepad .env

# Validate environment variables (custom script)
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT)"
```

### Port Management
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Kill all node processes
taskkill /IM node.exe /F

# Start on different port
set PORT=3001 && npm start
```

---

## 🛠️ Development Commands

### Node.js & npm Management
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list

# List global packages
npm list -g --depth=0

# Update npm to latest version
npm install -g npm@latest

# Clear npm cache
npm cache clean --force
```

### Package Management
```bash
# Install new package
npm install <package-name>

# Install development dependency
npm install --save-dev <package-name>

# Uninstall package
npm uninstall <package-name>

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Install specific version
npm install <package-name>@<version>
```

### Code Quality & Testing
```bash
# Install nodemon for development
npm install -g nodemon

# Run with nodemon
nodemon server.js

# Check for unused dependencies
npm prune

# Verify package integrity
npm install --package-lock-only
```

---

## 🔧 Troubleshooting Commands

### Connection Issues
```bash
# Test MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Check if port is in use
netstat -ano | findstr :3000

# Test HTTP connection
curl http://localhost:3000

# Check network connectivity
ping google.com
```

### Application Debugging
```bash
# Start with debug output
DEBUG=* npm start

# View application logs
npm start > app.log 2>&1

# Check process list
tasklist | findstr node

# Memory usage check
node --max-old-space-size=4096 server.js
```

### File System Operations
```bash
# Remove node_modules and reinstall
rmdir /s node_modules
npm install

# Clear temporary files
del /q /s temp\*

# Check disk space
dir /-c

# Find large files
forfiles /p . /s /m *.* /c "cmd /c if @fsize gtr 10485760 echo @path @fsize"
```

### Environment Debugging
```bash
# Print all environment variables
set

# Print specific environment variable
echo %PORT%

# Set temporary environment variable
set PORT=3001

# Check Node.js installation path
where node

# Check npm installation path
where npm
```

---

## 🚀 Deployment Commands

### Local Production Setup
```bash
# Set production environment
set NODE_ENV=production

# Install production dependencies only
npm install --production

# Start with PM2 (if installed)
npm install -g pm2
pm2 start server.js --name bloodfinder
pm2 status
pm2 logs bloodfinder
pm2 stop bloodfinder
```

### Build & Optimization
```bash
# Install build tools
npm install --save-dev webpack webpack-cli

# Minify assets (if configured)
npm run build

# Check bundle size
npm install -g bundlephobia
bundlephobia <package-name>
```

### Git Operations
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote origin
git remote add origin <repository-url>

# Push to GitHub
git push -u origin main

# Check git status
git status

# View commit history
git log --oneline
```

---

## 📊 Monitoring Commands

### System Monitoring
```bash
# Check system resources
wmic cpu get loadpercentage /value
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value

# Monitor network usage
netstat -e

# Check running services
sc query type= service state= all

# Monitor file changes
# (Install nodemon globally first)
nodemon --watch . --ext js,html,css server.js
```

### Application Monitoring
```bash
# Check application status
curl -I http://localhost:3000

# View real-time logs
tail -f app.log

# Check memory usage
node --inspect server.js

# Performance monitoring
npm install -g clinic
clinic doctor -- node server.js
```

---

## 🔐 Security Commands

### Password & Authentication
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Hash password (for testing)
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('password', 10))"

# Verify password
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.compareSync('password', 'hash'))"
```

### Security Auditing
```bash
# Run security audit
npm audit

# Fix security issues
npm audit fix

# Force fix (may break compatibility)
npm audit fix --force

# Check for known vulnerabilities
npm install -g nsp
nsp check
```

---

## 📝 Useful One-Liners

### Quick Status Check
```bash
# Check everything is running
net start MongoDB && node -e "console.log('Node.js:', process.version)" && npm --version && curl -s http://localhost:3000 || echo "Server not running"
```

### Quick Restart
```bash
# Restart everything
taskkill /IM node.exe /F && net stop MongoDB && net start MongoDB && npm start
```

### Quick Cleanup
```bash
# Clean and reinstall
rmdir /s node_modules && npm cache clean --force && npm install
```

### Environment Check
```bash
# Verify environment setup
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Missing'); console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Missing')"
```

---

## 🆘 Emergency Commands

### Force Kill Everything
```bash
# Kill all Node.js processes
taskkill /IM node.exe /F

# Kill MongoDB service
net stop MongoDB

# Kill processes using port 3000
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3000') do taskkill /PID %a /F
```

### Complete Reset
```bash
# Nuclear option - reset everything
net stop MongoDB
taskkill /IM node.exe /F
rmdir /s node_modules
npm cache clean --force
mongo bloodfinder --eval "db.dropDatabase()"
npm install
net start MongoDB
npm run seed
npm start
```

---

## 📞 Support Information

If you encounter issues with any of these commands:

1. **Check Prerequisites**: Ensure Node.js (v16+) and MongoDB are installed
2. **Verify Paths**: Make sure MongoDB installation path is correct
3. **Check Permissions**: Run Command Prompt as Administrator if needed
4. **Environment Variables**: Verify .env file is properly configured
5. **Port Conflicts**: Use different ports if 3000 is occupied

---

**💡 Pro Tip**: Bookmark this file and keep it handy during development!

**🩸 Happy coding and save lives with BloodFinder!**