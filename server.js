const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodfinder';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: function() { return this.role === 'donor'; } },
    role: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
    bloodGroup: { type: String, required: function() { return this.role === 'donor'; } },
    city: { type: String, required: true },
    address: { type: String, required: function() { return this.role === 'donor'; } },
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 0 },
    lastDonation: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Emergency Request Schema
const emergencySchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    hospital: { type: String, required: true },
    contactNumber: { type: String, required: true },
    urgencyLevel: { type: String, enum: ['critical', 'high', 'medium'], required: true },
    city: { type: String, required: true },
    additionalNotes: { type: String },
    status: { type: String, enum: ['active', 'resolved', 'cancelled'], default: 'active' },
    responses: [{ 
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        respondedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencySchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'bloodfinder_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'BloodFinder API is running!',
        timestamp: new Date().toISOString()
    });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, age, role, bloodGroup, city, address } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            age,
            role,
            bloodGroup: role === 'donor' ? bloodGroup : undefined,
            city,
            address: role === 'donor' ? address : undefined,
            isApproved: true // Auto-approve for simplified demo
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'bloodfinder_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            token,
            user: { 
                id: user._id, 
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email, 
                role: user.role,
                bloodGroup: user.bloodGroup,
                city: user.city,
                isAvailable: user.isAvailable
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcryptjs.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if donor is approved
        if (user.role === 'donor' && !user.isApproved) {
            return res.status(400).json({ success: false, message: 'Account pending approval' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'bloodfinder_secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { 
                id: user._id, 
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email, 
                role: user.role,
                bloodGroup: user.bloodGroup,
                city: user.city,
                isAvailable: user.isAvailable,
                totalDonations: user.totalDonations
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Donor Routes
app.put('/api/donor/availability', authenticateToken, async (req, res) => {
    try {
        const { isAvailable } = req.body;
        
        await User.findByIdAndUpdate(req.user.userId, { isAvailable });
        
        res.json({ success: true, message: 'Availability updated' });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// Search Donors
app.get('/api/donor/search', async (req, res) => {
    try {
        const { bloodGroup, city } = req.query;
        
        // Build search criteria
        const searchCriteria = {
            role: 'donor',
            city: new RegExp(city, 'i'),
            isApproved: true,
            isAvailable: true
        };
        
        // Only add bloodGroup filter if it's specified and not "ALL"
        if (bloodGroup && bloodGroup !== '' && bloodGroup !== 'ALL') {
            searchCriteria.bloodGroup = bloodGroup;
        }
        
        const donors = await User.find(searchCriteria)
            .select('firstName lastName bloodGroup city phone address isAvailable totalDonations')
            .sort({ totalDonations: -1, firstName: 1 }); // Sort by donations desc, then name

        res.json(donors);
    } catch (error) {
        console.error('Search donors error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

// Get all donors for admin (with pagination)
app.get('/api/donor/all', async (req, res) => {
    try {
        const { page = 1, limit = 20, city, bloodGroup } = req.query;
        
        const searchCriteria = { role: 'donor' };
        
        if (city) {
            searchCriteria.city = new RegExp(city, 'i');
        }
        
        if (bloodGroup && bloodGroup !== 'ALL') {
            searchCriteria.bloodGroup = bloodGroup;
        }
        
        const donors = await User.find(searchCriteria)
            .select('firstName lastName bloodGroup city phone address isAvailable totalDonations isApproved createdAt')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(searchCriteria);

        res.json({
            donors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get all donors error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch donors' });
    }
});

// Get emergency requests for donors
app.get('/api/emergency/requests', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'donor') {
            return res.status(403).json({ success: false, message: 'Donor access required' });
        }

        const emergencies = await EmergencyRequest.find({ 
            status: 'active',
            bloodGroup: user.bloodGroup,
            city: new RegExp(user.city, 'i')
        }).sort({ createdAt: -1 });

        res.json(emergencies);
    } catch (error) {
        console.error('Get emergency requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to get emergency requests' });
    }
});

// Emergency Routes
app.post('/api/emergency/create', async (req, res) => {
    try {
        const { patientName, bloodGroup, hospital, contactNumber, urgencyLevel, city, additionalNotes } = req.body;
        
        const emergency = new EmergencyRequest({
            patientName,
            bloodGroup,
            hospital,
            contactNumber,
            urgencyLevel,
            city,
            additionalNotes
        });

        await emergency.save();

        res.status(201).json({ 
            success: true, 
            message: 'Emergency request created successfully',
            emergency: emergency._id
        });
    } catch (error) {
        console.error('Create emergency error:', error);
        res.status(500).json({ success: false, message: 'Failed to create emergency request' });
    }
});

app.get('/api/emergency/active', async (req, res) => {
    try {
        const emergencies = await EmergencyRequest.find({ 
            status: 'active' 
        }).sort({ createdAt: -1 });

        res.json({ success: true, requests: emergencies });
    } catch (error) {
        console.error('Get emergencies error:', error);
        res.status(500).json({ success: false, message: 'Failed to get emergency requests' });
    }
});

app.post('/api/emergency/respond', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.body;
        
        const emergency = await EmergencyRequest.findById(requestId);
        if (!emergency) {
            return res.status(404).json({ success: false, message: 'Emergency request not found' });
        }

        // Check if donor already responded
        const alreadyResponded = emergency.responses.some(
            response => response.donor.toString() === req.user.userId
        );

        if (alreadyResponded) {
            return res.status(400).json({ success: false, message: 'Already responded to this request' });
        }

        // Add response
        emergency.responses.push({ donor: req.user.userId });
        await emergency.save();

        res.json({ success: true, message: 'Response recorded' });
    } catch (error) {
        console.error('Emergency response error:', error);
        res.status(500).json({ success: false, message: 'Failed to respond' });
    }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const totalDonors = await User.countDocuments({ role: 'donor', isApproved: true });
        const availableDonors = await User.countDocuments({ role: 'donor', isApproved: true, isAvailable: true });
        const emergencyRequests = await EmergencyRequest.countDocuments({ status: 'active' });
        const totalDonations = await User.aggregate([
            { $match: { role: 'donor' } },
            { $group: { _id: null, total: { $sum: '$totalDonations' } } }
        ]);

        res.json({
            totalDonors,
            availableDonors,
            emergencyRequests,
            totalDonations: totalDonations[0]?.total || 0
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

app.get('/api/admin/donors', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const donors = await User.find({ role: 'donor' })
            .select('firstName lastName email bloodGroup city phone isAvailable totalDonations createdAt')
            .sort({ createdAt: -1 });

        res.json(donors);
    } catch (error) {
        console.error('Admin get donors error:', error);
        res.status(500).json({ success: false, message: 'Failed to get donors' });
    }
});

app.get('/api/admin/emergency-requests', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const requests = await EmergencyRequest.find({ status: 'active' })
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Admin get emergency requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to get emergency requests' });
    }
});

app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const bloodGroupDistribution = await User.aggregate([
            { $match: { role: 'donor', isApproved: true } },
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const cityDistribution = await User.aggregate([
            { $match: { role: 'donor', isApproved: true } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            bloodGroupDistribution,
            cityDistribution
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});

app.put('/api/admin/donors/:donorId/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { isAvailable } = req.body;
        await User.findByIdAndUpdate(req.params.donorId, { isAvailable });
        
        res.json({ success: true, message: 'Donor status updated' });
    } catch (error) {
        console.error('Update donor status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update donor status' });
    }
});

app.put('/api/admin/emergency-requests/:requestId/resolve', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        await EmergencyRequest.findByIdAndUpdate(req.params.requestId, { status: 'resolved' });
        
        res.json({ success: true, message: 'Request marked as resolved' });
    } catch (error) {
        console.error('Resolve request error:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve request' });
    }
});

// Serve static files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Create default admin user
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@bloodfinder.com' });
        if (!adminExists) {
            const hashedPassword = await bcryptjs.hash('admin123', 10);
            const admin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@bloodfinder.com',
                password: hashedPassword,
                phone: '1234567890',
                role: 'admin',
                city: 'System',
                isApproved: true
            });
            await admin.save();
            console.log('✅ Default admin created: admin@bloodfinder.com / admin123');
        }
    } catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
};

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 BloodFinder Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${MONGODB_URI}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Create default admin
    await createDefaultAdmin();
});

module.exports = app;