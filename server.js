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

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for public feedback
    userName: { type: String, required: true },
    userEmail: { type: String, required: true }, // For public submissions
    userRole: { type: String, enum: ['donor', 'recipient', 'admin', 'public'], default: 'public' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, enum: ['platform', 'experience', 'suggestion', 'complaint', 'donor-feedback'], required: true },
    feedbackType: { type: String, enum: ['app', 'donor'], default: 'app' }, // New field
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to donor being reviewed
    donorName: { type: String }, // Store donor name for quick access
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    isPublicSubmission: { type: Boolean, default: false }, // Submitted without login
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    adminResponse: { type: String },
    respondedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Donation History Schema
const donationHistorySchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    donationDate: { type: Date, required: true },
    location: { type: String, required: true },
    hospital: { type: String, required: true },
    city: { type: String, required: true },
    quantity: { type: Number, required: true, default: 350 }, // in ml
    donationType: { type: String, enum: ['whole-blood', 'plasma', 'platelets', 'red-cells'], default: 'whole-blood' },
    recipientName: { type: String },
    emergencyRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyRequest' },
    healthCheckPassed: { type: Boolean, default: true },
    notes: { type: String },
    certificate: { type: String }, // Certificate number
    nextEligibleDate: { type: Date },
    status: { type: String, enum: ['completed', 'scheduled', 'cancelled'], default: 'completed' },
    createdAt: { type: Date, default: Date.now }
});

const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema);

// Blood Inventory Schema
const bloodInventorySchema = new mongoose.Schema({
    bloodGroup: { type: String, required: true },
    hospital: { type: String, required: true },
    city: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }, // in ml
    unitsAvailable: { type: Number, default: 0 }, // 1 unit = 350ml
    lastUpdated: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    status: { type: String, enum: ['available', 'low', 'critical', 'expired'], default: 'available' },
    minimumThreshold: { type: Number, default: 1000 }, // ml
    contactNumber: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['emergency', 'donation-reminder', 'eligibility', 'feedback', 'general', 'inventory-alert'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // Reference to emergency, donation, etc.
    actionUrl: { type: String },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

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

// Feedback Routes

// Public feedback submission (no authentication required)
app.post('/api/feedback/public-submit', async (req, res) => {
    try {
        const { userName, userEmail, rating, category, feedbackType, donorId, subject, message, isAnonymous } = req.body;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const feedbackData = {
            userName: isAnonymous ? 'Anonymous' : userName,
            userEmail,
            userRole: 'public',
            rating,
            category,
            feedbackType: feedbackType || 'app',
            subject,
            message,
            isAnonymous,
            isPublicSubmission: true
        };

        // If feedback is about a specific donor
        if (feedbackType === 'donor' && donorId) {
            const donor = await User.findById(donorId);
            if (donor && donor.role === 'donor') {
                feedbackData.donor = donorId;
                feedbackData.donorName = `${donor.firstName} ${donor.lastName}`;
            }
        }

        const feedback = new Feedback(feedbackData);
        await feedback.save();

        res.status(201).json({ 
            success: true, 
            message: 'Thank you for your feedback! We appreciate your input.',
            feedbackId: feedback._id
        });
    } catch (error) {
        console.error('Submit public feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
});

// Authenticated feedback submission (logged-in users)
app.post('/api/feedback/submit', authenticateToken, async (req, res) => {
    try {
        const { rating, category, feedbackType, donorId, subject, message, isAnonymous } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const feedbackData = {
            user: req.user.userId,
            userName: isAnonymous ? 'Anonymous' : `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            userRole: user.role,
            rating,
            category,
            feedbackType: feedbackType || 'app',
            subject,
            message,
            isAnonymous,
            isPublicSubmission: false
        };

        // If feedback is about a specific donor
        if (feedbackType === 'donor' && donorId) {
            const donor = await User.findById(donorId);
            if (donor && donor.role === 'donor') {
                feedbackData.donor = donorId;
                feedbackData.donorName = `${donor.firstName} ${donor.lastName}`;
            }
        }

        const feedback = new Feedback(feedbackData);
        await feedback.save();

        res.status(201).json({ 
            success: true, 
            message: 'Feedback submitted successfully',
            feedbackId: feedback._id
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
});

// Get list of donors for feedback (public access)
app.get('/api/feedback/donors-list', async (req, res) => {
    try {
        const donors = await User.find({ role: 'donor', isApproved: true })
            .select('firstName lastName bloodGroup city totalDonations')
            .sort({ totalDonations: -1 });

        res.json(donors);
    } catch (error) {
        console.error('Get donors list error:', error);
        res.status(500).json({ success: false, message: 'Failed to get donors list' });
    }
});

app.get('/api/feedback/my-feedbacks', authenticateToken, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.userId })
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        console.error('Get my feedbacks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get feedbacks' });
    }
});

app.get('/api/feedback/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { status, category } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (category) filter.category = category;

        const feedbacks = await Feedback.find(filter)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        console.error('Get all feedbacks error:', error);
        res.status(500).json({ success: false, message: 'Failed to get feedbacks' });
    }
});

app.put('/api/feedback/:feedbackId/respond', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { adminResponse, status } = req.body;
        
        await Feedback.findByIdAndUpdate(req.params.feedbackId, {
            adminResponse,
            status: status || 'reviewed',
            respondedAt: Date.now()
        });

        res.json({ success: true, message: 'Response added successfully' });
    } catch (error) {
        console.error('Respond to feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to respond to feedback' });
    }
});

// Donation History Routes
app.post('/api/donation/record', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { donorId, donationDate, location, hospital, city, quantity, donationType, recipientName, notes } = req.body;
        
        const donor = await User.findById(donorId);
        if (!donor || donor.role !== 'donor') {
            return res.status(404).json({ success: false, message: 'Donor not found' });
        }

        // Calculate next eligible date (56 days for whole blood, 7 days for plasma)
        const nextEligible = new Date(donationDate);
        if (donationType === 'plasma') {
            nextEligible.setDate(nextEligible.getDate() + 7);
        } else {
            nextEligible.setDate(nextEligible.getDate() + 56);
        }

        const donation = new DonationHistory({
            donor: donorId,
            donorName: `${donor.firstName} ${donor.lastName}`,
            bloodGroup: donor.bloodGroup,
            donationDate,
            location,
            hospital,
            city,
            quantity: quantity || 350,
            donationType: donationType || 'whole-blood',
            recipientName,
            notes,
            nextEligibleDate: nextEligible,
            certificate: `CERT-${Date.now()}-${donor._id.toString().slice(-4)}`
        });

        await donation.save();

        // Update donor's donation count and last donation date
        await User.findByIdAndUpdate(donorId, {
            $inc: { totalDonations: 1 },
            lastDonation: donationDate
        });

        res.status(201).json({ 
            success: true, 
            message: 'Donation recorded successfully',
            donation
        });
    } catch (error) {
        console.error('Record donation error:', error);
        res.status(500).json({ success: false, message: 'Failed to record donation' });
    }
});

// Donor submits their own donation
app.post('/api/donation/submit', authenticateToken, async (req, res) => {
    try {
        console.log('📋 Donation submission request from user:', req.user);
        console.log('📋 Request body:', req.body);
        
        if (req.user.role !== 'donor') {
            console.log('❌ User is not a donor, role:', req.user.role);
            return res.status(403).json({ success: false, error: 'Only donors can submit donations' });
        }

        const { donationDate, hospital, location, city, quantity, donationType, recipientName, certificate, notes, status } = req.body;
        
        // Validate required fields
        if (!donationDate || !hospital || !city) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ success: false, error: 'Missing required fields: donationDate, hospital, and city are required' });
        }
        
        const donor = await User.findById(req.user.userId);
        if (!donor) {
            console.log('❌ Donor not found with ID:', req.user.userId);
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        
        console.log('✅ Donor found:', donor.firstName, donor.lastName);

        // Calculate next eligible date (56 days for whole blood, 7 days for plasma)
        const nextEligible = new Date(donationDate);
        if (donationType === 'plasma') {
            nextEligible.setDate(nextEligible.getDate() + 7);
        } else if (donationType === 'platelets') {
            nextEligible.setDate(nextEligible.getDate() + 7);
        } else {
            nextEligible.setDate(nextEligible.getDate() + 56); // whole blood
        }

        // Only include certificate if provided by user
        const donationData = {
            donor: req.user.userId,
            donorName: `${donor.firstName} ${donor.lastName}`,
            bloodGroup: donor.bloodGroup,
            donationDate,
            location: location || hospital,
            hospital,
            city,
            quantity: quantity || 350,
            donationType: donationType || 'whole-blood',
            nextEligibleDate: nextEligible,
            status: status || 'completed'
        };

        // Only add optional fields if they are provided and not empty strings
        if (recipientName && recipientName.trim() !== '') {
            donationData.recipientName = recipientName.trim();
        }
        if (notes && notes.trim() !== '') {
            donationData.notes = notes.trim();
        }
        if (certificate && certificate.trim() !== '') {
            donationData.certificate = certificate.trim();
        }

        const donation = new DonationHistory(donationData);

        await donation.save();
        console.log('✅ Donation saved:', donation._id);

        // Update donor's donation count and last donation date
        const updatedDonor = await User.findByIdAndUpdate(req.user.userId, {
            $inc: { totalDonations: 1 },
            lastDonation: donationDate
        }, { new: true });
        console.log('✅ Donor updated, total donations:', updatedDonor.totalDonations);

        res.status(201).json({ 
            success: true, 
            message: 'Donation submitted successfully! Thank you for saving lives! 🎉',
            donation
        });
    } catch (error) {
        console.error('❌ Submit donation error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, error: error.message || 'Failed to submit donation' });
    }
});

// Get donation history for specific user or all (admin)
app.get('/api/donation/history', authenticateToken, async (req, res) => {
    try {
        let filter = {};
        
        if (req.user.role === 'donor') {
            filter.donor = req.user.userId;
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { bloodGroup, city, startDate, endDate } = req.query;
        
        if (bloodGroup) filter.bloodGroup = bloodGroup;
        if (city) filter.city = new RegExp(city, 'i');
        if (startDate || endDate) {
            filter.donationDate = {};
            if (startDate) filter.donationDate.$gte = new Date(startDate);
            if (endDate) filter.donationDate.$lte = new Date(endDate);
        }

        const donations = await DonationHistory.find(filter)
            .populate('donor', 'firstName lastName email phone')
            .sort({ donationDate: -1 });

        res.json(donations);
    } catch (error) {
        console.error('Get donation history error:', error);
        res.status(500).json({ success: false, message: 'Failed to get donation history' });
    }
});

// Alias endpoint for donor's own donations
app.get('/api/donation/my-donations', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'donor') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const donations = await DonationHistory.find({ donor: req.user.userId })
            .sort({ donationDate: -1 });

        res.json(donations);
    } catch (error) {
        console.error('Get my donations error:', error);
        res.status(500).json({ success: false, message: 'Failed to get donations' });
    }
});

app.get('/api/donation/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.role === 'donor' ? req.user.userId : null;
        
        const filter = userId ? { donor: userId } : {};
        
        const totalDonations = await DonationHistory.countDocuments(filter);
        const totalQuantity = await DonationHistory.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        const lastDonation = await DonationHistory.findOne(filter)
            .sort({ donationDate: -1 });

        const donationsByType = await DonationHistory.aggregate([
            { $match: filter },
            { $group: { _id: '$donationType', count: { $sum: 1 } } }
        ]);

        res.json({
            totalDonations,
            totalQuantity: totalQuantity[0]?.total || 0,
            lastDonation,
            donationsByType
        });
    } catch (error) {
        console.error('Get donation stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get donation stats' });
    }
});

// Comprehensive Analytics for Admin Dashboard
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        // Total counts
        const totalDonors = await User.countDocuments({ role: 'donor', isApproved: true });
        const totalDonations = await DonationHistory.countDocuments({});
        const activeEmergencies = await EmergencyRequest.countDocuments({ status: 'active' });
        const livesSaved = totalDonations * 3; // Each donation saves up to 3 lives

        // Blood group distribution
        const bloodGroupDist = await User.aggregate([
            { $match: { role: 'donor', isApproved: true } },
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // City-wise distribution
        const cityDist = await User.aggregate([
            { $match: { role: 'donor', isApproved: true } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Donations over time (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const donationsOverTime = await DonationHistory.aggregate([
            { $match: { donationDate: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$donationDate' },
                        month: { $month: '$donationDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Donation types breakdown
        const donationTypes = await DonationHistory.aggregate([
            { $group: { _id: '$donationType', count: { $sum: 1 } } }
        ]);

        // Inventory status by blood group
        const inventoryStatus = await BloodInventory.aggregate([
            {
                $group: {
                    _id: '$bloodGroup',
                    totalQuantity: { $sum: '$quantity' },
                    hospitals: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalDonors,
                totalDonations,
                activeEmergencies,
                livesSaved
            },
            bloodGroupDist,
            cityDist,
            donationsOverTime,
            donationTypes,
            inventoryStatus
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics data' });
    }
});

// Blood Inventory Routes
app.post('/api/inventory/add', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { bloodGroup, hospital, city, quantity, unitType, expiryDate, lastUpdated, contactNumber, notes } = req.body;
        
        // Convert quantity to ml based on unit type
        let quantityInMl = quantity;
        if (unitType === 'units' || unitType === 'bags') {
            quantityInMl = quantity * 350; // 1 unit/bag = 350ml
        }
        
        // Check if inventory entry exists for this hospital and blood group
        let inventory = await BloodInventory.findOne({ bloodGroup, hospital, city });
        
        if (inventory) {
            // Update existing inventory
            inventory.quantity += quantityInMl;
            inventory.unitsAvailable = Math.floor(inventory.quantity / 350);
            inventory.lastUpdated = lastUpdated || Date.now();
            if (expiryDate) inventory.expiryDate = expiryDate;
            if (contactNumber) inventory.contactNumber = contactNumber;
            if (notes) inventory.notes = notes;
            
            // Update status based on quantity
            if (inventory.quantity < inventory.minimumThreshold * 0.3) {
                inventory.status = 'critical';
            } else if (inventory.quantity < inventory.minimumThreshold) {
                inventory.status = 'low';
            } else {
                inventory.status = 'available';
            }
            
            await inventory.save();
            
            res.status(200).json({ 
                success: true, 
                message: 'Inventory updated successfully! Added to existing record.',
                inventory
            });
        } else {
            // Create new inventory entry
            inventory = new BloodInventory({
                bloodGroup,
                hospital,
                city,
                quantity: quantityInMl,
                unitsAvailable: Math.floor(quantityInMl / 350),
                expiryDate,
                lastUpdated: lastUpdated || Date.now(),
                contactNumber,
                notes,
                status: quantityInMl < 1000 * 0.3 ? 'critical' : quantityInMl < 1000 ? 'low' : 'available'
            });
            
            await inventory.save();
            
            res.status(201).json({ 
                success: true, 
                message: 'New inventory record created successfully!',
                inventory
            });
        }
    } catch (error) {
        console.error('Add inventory error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add inventory' });
    }
});

app.get('/api/inventory/search', async (req, res) => {
    try {
        const { bloodGroup, city, hospital } = req.query;
        
        const filter = { status: { $ne: 'expired' } };
        
        if (bloodGroup && bloodGroup !== 'ALL') filter.bloodGroup = bloodGroup;
        if (city) filter.city = new RegExp(city, 'i');
        if (hospital) filter.hospital = new RegExp(hospital, 'i');

        const inventory = await BloodInventory.find(filter)
            .sort({ status: 1, quantity: -1 });

        res.json(inventory);
    } catch (error) {
        console.error('Search inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to search inventory' });
    }
});

app.get('/api/inventory/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const inventory = await BloodInventory.find()
            .sort({ status: 1, lastUpdated: -1 });

        res.json(inventory);
    } catch (error) {
        console.error('Get all inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to get inventory' });
    }
});

app.put('/api/inventory/:inventoryId/update', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { quantity, status, notes } = req.body;
        
        const inventory = await BloodInventory.findById(req.params.inventoryId);
        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        if (quantity !== undefined) {
            inventory.quantity = quantity;
            inventory.unitsAvailable = Math.floor(quantity / 350);
        }
        if (status) inventory.status = status;
        if (notes) inventory.notes = notes;
        
        inventory.lastUpdated = Date.now();
        
        await inventory.save();

        res.json({ success: true, message: 'Inventory updated successfully' });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to update inventory' });
    }
});

app.get('/api/inventory/alerts', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const criticalInventory = await BloodInventory.find({ 
            status: { $in: ['critical', 'low'] } 
        }).sort({ status: 1, quantity: 1 });

        res.json(criticalInventory);
    } catch (error) {
        console.error('Get inventory alerts error:', error);
        res.status(500).json({ success: false, message: 'Failed to get inventory alerts' });
    }
});

// Notification Routes
app.post('/api/notifications/create', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { recipientId, type, title, message, priority, relatedId, actionUrl, expiresAt } = req.body;
        
        const notification = new Notification({
            recipient: recipientId,
            type,
            title,
            message,
            priority: priority || 'medium',
            relatedId,
            actionUrl,
            expiresAt
        });

        await notification.save();

        res.status(201).json({ 
            success: true, 
            message: 'Notification created successfully',
            notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
});

app.get('/api/notifications/my-notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipient: req.user.userId,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gte: new Date() } }
            ]
        }).sort({ createdAt: -1, priority: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
});

app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            recipient: req.user.userId,
            isRead: false,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gte: new Date() } }
            ]
        });

        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Failed to get unread count' });
    }
});

app.put('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user.userId },
            { isRead: true }
        );

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
});

app.put('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
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