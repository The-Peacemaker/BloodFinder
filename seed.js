// Complete Database Seeding - All Tables with Rich Data
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodfinder';

// Define all schemas
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    age: Number,
    role: String,
    bloodGroup: String,
    city: String,
    address: String,
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 0 },
    lastDonation: Date,
    createdAt: { type: Date, default: Date.now }
});

const emergencySchema = new mongoose.Schema({
    patientName: String,
    bloodGroup: String,
    hospital: String,
    contactNumber: String,
    urgencyLevel: String,
    city: String,
    additionalNotes: String,
    status: { type: String, default: 'active' },
    responses: [{ 
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        respondedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: String,
    feedbackType: { type: String, enum: ['app', 'donor'], default: 'app' },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    category: String,
    status: { type: String, default: 'pending' },
    isPublicSubmission: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const donationHistorySchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: String,
    bloodGroup: String,
    donationDate: { type: Date, required: true },
    hospital: String,
    city: String,
    donationType: { type: String, enum: ['whole-blood', 'plasma', 'platelets', 'red-cells'], default: 'whole-blood' },
    quantity: { type: Number, default: 450 },
    certificate: String,
    recipientName: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
    bloodGroup: String,
    hospital: String,
    city: String,
    contactNumber: String,
    quantity: Number,
    unitsAvailable: Number,
    status: { type: String, enum: ['available', 'low', 'critical'], default: 'available' },
    expiryDate: Date,
    lastUpdated: { type: Date, default: Date.now },
    notes: String
});

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    title: String,
    message: String,
    priority: { type: String, default: 'normal' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const EmergencyRequest = mongoose.model('EmergencyRequest', emergencySchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema);
const BloodInventory = mongoose.model('BloodInventory', inventorySchema);
const Notification = mongoose.model('Notification', notificationSchema);

async function clearDatabase() {
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $ne: 'admin@bloodfinder.com' } });
    await EmergencyRequest.deleteMany({});
    await Feedback.deleteMany({});
    await DonationHistory.deleteMany({});
    await BloodInventory.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Database cleared (kept admin user)');
}

async function seedUsers() {
    console.log('\n👥 Seeding Users...');
    
    const hashedPassword = await bcryptjs.hash('donor123', 10);
    
    const users = [
        // Admin
        {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@bloodfinder.com',
            password: await bcryptjs.hash('admin123', 10),
            phone: '+919999999999',
            role: 'admin',
            city: 'Mumbai',
            isApproved: true
        },
        // Donors - 50+ diverse donors
        { firstName: 'Arjun', lastName: 'Nair', email: 'arjun.nair@email.com', password: hashedPassword, phone: '+919876543210', age: 28, role: 'donor', bloodGroup: 'O+', city: 'Thiruvananthapuram', address: 'TC 15/2847, Pattom', totalDonations: 12, isAvailable: true },
        { firstName: 'Priya', lastName: 'Menon', email: 'priya.menon@email.com', password: hashedPassword, phone: '+919876543211', age: 25, role: 'donor', bloodGroup: 'A+', city: 'Kochi', address: 'Marine Drive, Ernakulam', totalDonations: 8, isAvailable: true },
        { firstName: 'Rahul', lastName: 'Pillai', email: 'rahul.pillai@email.com', password: hashedPassword, phone: '+919876543212', age: 32, role: 'donor', bloodGroup: 'B+', city: 'Kozhikode', address: 'Mavoor Road', totalDonations: 15, isAvailable: true },
        { firstName: 'Anjali', lastName: 'Krishnan', email: 'anjali.k@email.com', password: hashedPassword, phone: '+919876543213', age: 29, role: 'donor', bloodGroup: 'AB+', city: 'Thrissur', address: 'Swaraj Round', totalDonations: 6, isAvailable: true },
        { firstName: 'Vivek', lastName: 'Sharma', email: 'vivek.sharma@email.com', password: hashedPassword, phone: '+919876543214', age: 26, role: 'donor', bloodGroup: 'O-', city: 'Mumbai', address: 'Bandra West', totalDonations: 10, isAvailable: true },
        { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@email.com', password: hashedPassword, phone: '+919876543215', age: 27, role: 'donor', bloodGroup: 'A-', city: 'Bangalore', address: 'Koramangala', totalDonations: 9, isAvailable: true },
        { firstName: 'Kiran', lastName: 'Kumar', email: 'kiran.kumar@email.com', password: hashedPassword, phone: '+919876543216', age: 30, role: 'donor', bloodGroup: 'B-', city: 'Kottayam', address: 'MC Road', totalDonations: 7, isAvailable: true },
        { firstName: 'Meera', lastName: 'Warrier', email: 'meera.warrier@email.com', password: hashedPassword, phone: '+919876543217', age: 24, role: 'donor', bloodGroup: 'AB-', city: 'Alappuzha', address: 'Boat Jetty Road', totalDonations: 4, isAvailable: true },
        { firstName: 'Ravi', lastName: 'Patel', email: 'ravi.patel@email.com', password: hashedPassword, phone: '+919876543218', age: 33, role: 'donor', bloodGroup: 'O+', city: 'Ahmedabad', address: 'SG Highway', totalDonations: 11, isAvailable: true },
        { firstName: 'Deepika', lastName: 'Singh', email: 'deepika.singh@email.com', password: hashedPassword, phone: '+919876543219', age: 26, role: 'donor', bloodGroup: 'A+', city: 'Delhi', address: 'Connaught Place', totalDonations: 5, isAvailable: true },
        { firstName: 'Suresh', lastName: 'Babu', email: 'suresh.babu@email.com', password: hashedPassword, phone: '+919876543220', age: 31, role: 'donor', bloodGroup: 'B+', city: 'Chennai', address: 'T Nagar', totalDonations: 13, isAvailable: true },
        { firstName: 'Lakshmi', lastName: 'Iyer', email: 'lakshmi.iyer@email.com', password: hashedPassword, phone: '+919876543221', age: 28, role: 'donor', bloodGroup: 'O+', city: 'Pune', address: 'FC Road', totalDonations: 6, isAvailable: true },
        { firstName: 'Aditya', lastName: 'Verma', email: 'aditya.verma@email.com', password: hashedPassword, phone: '+919876543222', age: 29, role: 'donor', bloodGroup: 'AB+', city: 'Hyderabad', address: 'Hitech City', totalDonations: 8, isAvailable: true },
        { firstName: 'Divya', lastName: 'Nambiar', email: 'divya.nambiar@email.com', password: hashedPassword, phone: '+919876543223', age: 25, role: 'donor', bloodGroup: 'A+', city: 'Kannur', address: 'SM Street', totalDonations: 5, isAvailable: true },
        { firstName: 'Rohan', lastName: 'Desai', email: 'rohan.desai@email.com', password: hashedPassword, phone: '+919876543224', age: 34, role: 'donor', bloodGroup: 'O-', city: 'Surat', address: 'Ring Road', totalDonations: 14, isAvailable: true },
        { firstName: 'Neha', lastName: 'Kapoor', email: 'neha.kapoor@email.com', password: hashedPassword, phone: '+919876543225', age: 27, role: 'donor', bloodGroup: 'B+', city: 'Kolkata', address: 'Park Street', totalDonations: 7, isAvailable: true },
        { firstName: 'Amit', lastName: 'Joshi', email: 'amit.joshi@email.com', password: hashedPassword, phone: '+919876543226', age: 30, role: 'donor', bloodGroup: 'A-', city: 'Jaipur', address: 'MI Road', totalDonations: 9, isAvailable: true },
        { firstName: 'Pooja', lastName: 'Chandran', email: 'pooja.chandran@email.com', password: hashedPassword, phone: '+919876543227', age: 26, role: 'donor', bloodGroup: 'AB-', city: 'Kollam', address: 'Beach Road', totalDonations: 4, isAvailable: true },
        { firstName: 'Sanjay', lastName: 'Gupta', email: 'sanjay.gupta@email.com', password: hashedPassword, phone: '+919876543228', age: 35, role: 'donor', bloodGroup: 'O+', city: 'Lucknow', address: 'Hazratganj', totalDonations: 16, isAvailable: true },
        { firstName: 'Kavya', lastName: 'Menon', email: 'kavya.menon@email.com', password: hashedPassword, phone: '+919876543229', age: 24, role: 'donor', bloodGroup: 'B+', city: 'Palakkad', address: 'MB Road', totalDonations: 3, isAvailable: true },
        { firstName: 'Vikram', lastName: 'Rao', email: 'vikram.rao@email.com', password: hashedPassword, phone: '+919876543230', age: 32, role: 'donor', bloodGroup: 'A+', city: 'Mysore', address: 'KRS Road', totalDonations: 10, isAvailable: true },
        { firstName: 'Ananya', lastName: 'Das', email: 'ananya.das@email.com', password: hashedPassword, phone: '+919876543231', age: 28, role: 'donor', bloodGroup: 'O+', city: 'Bhubaneswar', address: 'Saheed Nagar', totalDonations: 7, isAvailable: true },
        { firstName: 'Rajesh', lastName: 'Nair', email: 'rajesh.nair@email.com', password: hashedPassword, phone: '+919876543232', age: 36, role: 'donor', bloodGroup: 'AB+', city: 'Thiruvananthapuram', address: 'Vazhuthacaud', totalDonations: 18, isAvailable: true },
        { firstName: 'Shweta', lastName: 'Pillai', email: 'shweta.pillai@email.com', password: hashedPassword, phone: '+919876543233', age: 25, role: 'donor', bloodGroup: 'B-', city: 'Kochi', address: 'Kaloor', totalDonations: 5, isAvailable: true },
        { firstName: 'Manoj', lastName: 'Kumar', email: 'manoj.kumar@email.com', password: hashedPassword, phone: '+919876543234', age: 31, role: 'donor', bloodGroup: 'O-', city: 'Nagpur', address: 'Sitabuldi', totalDonations: 12, isAvailable: false },
        { firstName: 'Preeti', lastName: 'Sharma', email: 'preeti.sharma@email.com', password: hashedPassword, phone: '+919876543235', age: 29, role: 'donor', bloodGroup: 'A+', city: 'Chandigarh', address: 'Sector 17', totalDonations: 8, isAvailable: true },
        { firstName: 'Harish', lastName: 'Menon', email: 'harish.menon@email.com', password: hashedPassword, phone: '+919876543236', age: 33, role: 'donor', bloodGroup: 'B+', city: 'Kozhikode', address: 'Puthiyara', totalDonations: 14, isAvailable: true },
        { firstName: 'Nisha', lastName: 'Krishnan', email: 'nisha.krishnan@email.com', password: hashedPassword, phone: '+919876543237', age: 27, role: 'donor', bloodGroup: 'O+', city: 'Thrissur', address: 'Round East', totalDonations: 6, isAvailable: true },
        { firstName: 'Abhishek', lastName: 'Reddy', email: 'abhishek.reddy@email.com', password: hashedPassword, phone: '+919876543238', age: 30, role: 'donor', bloodGroup: 'AB+', city: 'Visakhapatnam', address: 'MVP Colony', totalDonations: 9, isAvailable: true },
        { firstName: 'Reshma', lastName: 'Nair', email: 'reshma.nair@email.com', password: hashedPassword, phone: '+919876543239', age: 26, role: 'donor', bloodGroup: 'A-', city: 'Alappuzha', address: 'Beach Road', totalDonations: 4, isAvailable: true },
        // More donors for better analytics
        { firstName: 'Gopal', lastName: 'Krishna', email: 'gopal.krishna@email.com', password: hashedPassword, phone: '+919876543240', age: 34, role: 'donor', bloodGroup: 'O+', city: 'Mumbai', address: 'Andheri East', totalDonations: 15, isAvailable: true },
        { firstName: 'Sowmya', lastName: 'Menon', email: 'sowmya.menon@email.com', password: hashedPassword, phone: '+919876543241', age: 28, role: 'donor', bloodGroup: 'B+', city: 'Bangalore', address: 'Whitefield', totalDonations: 7, isAvailable: true },
        { firstName: 'Akash', lastName: 'Pillai', email: 'akash.pillai@email.com', password: hashedPassword, phone: '+919876543242', age: 25, role: 'donor', bloodGroup: 'A+', city: 'Kochi', address: 'Palarivattom', totalDonations: 5, isAvailable: true },
        { firstName: 'Vidya', lastName: 'Balan', email: 'vidya.balan@email.com', password: hashedPassword, phone: '+919876543243', age: 32, role: 'donor', bloodGroup: 'AB+', city: 'Delhi', address: 'Vasant Vihar', totalDonations: 11, isAvailable: true },
        { firstName: 'Ramesh', lastName: 'Varma', email: 'ramesh.varma@email.com', password: hashedPassword, phone: '+919876543244', age: 29, role: 'donor', bloodGroup: 'O+', city: 'Pune', address: 'Hinjewadi', totalDonations: 8, isAvailable: true },
        { firstName: 'Shruti', lastName: 'Nair', email: 'shruti.nair@email.com', password: hashedPassword, phone: '+919876543245', age: 27, role: 'donor', bloodGroup: 'B+', city: 'Thiruvananthapuram', address: 'Kazhakootam', totalDonations: 6, isAvailable: true },
        { firstName: 'Naveen', lastName: 'Kumar', email: 'naveen.kumar@email.com', password: hashedPassword, phone: '+919876543246', age: 31, role: 'donor', bloodGroup: 'A+', city: 'Chennai', address: 'Adyar', totalDonations: 10, isAvailable: true },
        { firstName: 'Latha', lastName: 'Menon', email: 'latha.menon@email.com', password: hashedPassword, phone: '+919876543247', age: 26, role: 'donor', bloodGroup: 'O-', city: 'Kottayam', address: 'Medical College', totalDonations: 4, isAvailable: true },
        { firstName: 'Siddharth', lastName: 'Sharma', email: 'siddharth.sharma@email.com', password: hashedPassword, phone: '+919876543248', age: 33, role: 'donor', bloodGroup: 'AB-', city: 'Hyderabad', address: 'Banjara Hills', totalDonations: 12, isAvailable: true },
        { firstName: 'Madhavi', lastName: 'Pillai', email: 'madhavi.pillai@email.com', password: hashedPassword, phone: '+919876543249', age: 24, role: 'donor', bloodGroup: 'B+', city: 'Kozhikode', address: 'Medical College', totalDonations: 3, isAvailable: true },
        { firstName: 'Arun', lastName: 'Nair', email: 'arun.nair@email.com', password: hashedPassword, phone: '+919876543250', age: 35, role: 'donor', bloodGroup: 'O+', city: 'Kochi', address: 'Kakkanad', totalDonations: 17, isAvailable: true }
    ];

    let added = 0;
    for (const userData of users) {
        try {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                await User.create(userData);
                added++;
            }
        } catch (error) {
            console.log(`⚠️  Skipping ${userData.email}: ${error.message}`);
        }
    }
    
    console.log(`✅ Added ${added} users`);
    return User.find({ role: 'donor' });
}

async function seedEmergencyRequests() {
    console.log('\n🚨 Seeding Emergency Requests...');
    
    const requests = [
        { patientName: 'Rajesh Kumar', bloodGroup: 'O-', hospital: 'SCTIMST', contactNumber: '+919876501001', urgencyLevel: 'critical', city: 'Thiruvananthapuram', additionalNotes: 'Major surgery scheduled, universal donor needed urgently', status: 'active' },
        { patientName: 'Lakshmi Devi', bloodGroup: 'AB+', hospital: 'Aster Medcity', contactNumber: '+919876501002', urgencyLevel: 'high', city: 'Kochi', additionalNotes: 'Cardiac surgery patient, needs blood within 2 hours', status: 'active' },
        { patientName: 'Mohammed Ali', bloodGroup: 'B+', hospital: 'MIMS Hospital', contactNumber: '+919876501003', urgencyLevel: 'medium', city: 'Kozhikode', additionalNotes: 'Accident victim, stable condition', status: 'active' },
        { patientName: 'Sunitha Menon', bloodGroup: 'A+', hospital: 'Amrita Institute', contactNumber: '+919876501004', urgencyLevel: 'critical', city: 'Kochi', additionalNotes: 'Emergency cesarean, mother and baby need immediate attention', status: 'active' },
        { patientName: 'Ramesh Babu', bloodGroup: 'O+', hospital: 'Apollo Hospital', contactNumber: '+919876501005', urgencyLevel: 'high', city: 'Bangalore', additionalNotes: 'Cancer patient undergoing chemotherapy', status: 'active' },
        { patientName: 'Geetha Krishnan', bloodGroup: 'B-', hospital: 'Medical Trust Hospital', contactNumber: '+919876501006', urgencyLevel: 'critical', city: 'Kochi', additionalNotes: 'Rare blood type needed for emergency surgery', status: 'active' },
        { patientName: 'Santhosh Kumar', bloodGroup: 'AB-', hospital: 'Jubilee Mission', contactNumber: '+919876501007', urgencyLevel: 'high', city: 'Thrissur', additionalNotes: 'Post-operative complication, needs immediate transfusion', status: 'active' },
        { patientName: 'Baby Aisha', bloodGroup: 'O+', hospital: 'SAT Hospital', contactNumber: '+919876501008', urgencyLevel: 'critical', city: 'Thiruvananthapuram', additionalNotes: 'Newborn with blood disorder, urgent requirement', status: 'active' },
        { patientName: 'Vijayan Pillai', bloodGroup: 'A-', hospital: 'Lisie Hospital', contactNumber: '+919876501009', urgencyLevel: 'medium', city: 'Kochi', additionalNotes: 'Scheduled surgery tomorrow morning', status: 'active' },
        { patientName: 'Preethi Nair', bloodGroup: 'O+', hospital: 'Baby Memorial', contactNumber: '+919876501010', urgencyLevel: 'high', city: 'Kozhikode', additionalNotes: 'Delivery complications, needs 2 units', status: 'active' },
        { patientName: 'Kumar Swamy', bloodGroup: 'B+', hospital: 'Manipal Hospital', contactNumber: '+919876501011', urgencyLevel: 'medium', city: 'Bangalore', additionalNotes: 'Dengue patient with low platelet count', status: 'active' },
        { patientName: 'Radha Devi', bloodGroup: 'A+', hospital: 'KIMS Hospital', contactNumber: '+919876501012', urgencyLevel: 'high', city: 'Thiruvananthapuram', additionalNotes: 'Thalassemia patient, regular transfusion needed', status: 'active' }
    ];

    const created = await EmergencyRequest.insertMany(requests);
    console.log(`✅ Added ${created.length} emergency requests`);
}

async function seedFeedback(donors) {
    console.log('\n💬 Seeding Feedback...');
    
    const feedbacks = [
        // Public feedback (no login)
        { userEmail: 'citizen1@gmail.com', feedbackType: 'app', rating: 5, comment: 'Excellent platform! Found a donor within minutes during an emergency. Life-saving service!', category: 'experience', status: 'pending', isPublicSubmission: true },
        { userEmail: 'user.public@yahoo.com', feedbackType: 'app', rating: 4, comment: 'Very helpful app. The search feature is fast and accurate. Would love to see more filtering options.', category: 'suggestion', status: 'pending', isPublicSubmission: true },
        { userEmail: 'emergency.user@gmail.com', feedbackType: 'app', rating: 5, comment: 'This app saved my father\'s life! We got 3 donors within 30 minutes. Thank you BloodFinder team!', category: 'platform', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'health.worker@gmail.com', feedbackType: 'app', rating: 4, comment: 'Great initiative. Please add notification feature for nearby emergencies.', category: 'suggestion', status: 'pending', isPublicSubmission: true },
        // Donor-specific feedback
        { userEmail: 'patient.family@gmail.com', feedbackType: 'donor', donor: donors[0]._id, rating: 5, comment: 'Arjun responded immediately and donated blood at midnight. True hero! 🙏', category: 'experience', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'emergency.contact@gmail.com', feedbackType: 'donor', donor: donors[1]._id, rating: 5, comment: 'Priya was very professional and kind. Traveled 20km to help. Grateful!', category: 'experience', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'hospital.staff@gmail.com', feedbackType: 'donor', donor: donors[2]._id, rating: 5, comment: 'Rahul has donated 15 times! Highly reliable and always available. Community hero!', category: 'platform', status: 'resolved', isPublicSubmission: true },
        { userEmail: 'patient.brother@gmail.com', feedbackType: 'donor', donor: donors[4]._id, rating: 4, comment: 'Vivek helped during critical O- emergency. Quick response and professional.', category: 'experience', status: 'reviewed', isPublicSubmission: true },
        // Authenticated user feedback
        { user: donors[5]._id, userEmail: donors[5].email, feedbackType: 'app', rating: 5, comment: 'As a regular donor, this app makes it easy to help people. Love the interface!', category: 'platform', status: 'reviewed', isPublicSubmission: false },
        { user: donors[6]._id, userEmail: donors[6].email, feedbackType: 'app', rating: 4, comment: 'Good app but needs better notification system for emergency alerts.', category: 'suggestion', status: 'pending', isPublicSubmission: false },
        { user: donors[10]._id, userEmail: donors[10].email, feedbackType: 'app', rating: 5, comment: 'Best blood donation platform in India! Easy to use and effective.', category: 'platform', status: 'reviewed', isPublicSubmission: false },
        // More public feedback
        { userEmail: 'recipient2024@gmail.com', feedbackType: 'app', rating: 5, comment: 'Found 5 matching donors in my city instantly. Amazing service!', category: 'experience', status: 'pending', isPublicSubmission: true },
        { userEmail: 'medical.student@gmail.com', feedbackType: 'app', rating: 4, comment: 'Excellent concept. Would be great to have donation history tracking.', category: 'suggestion', status: 'pending', isPublicSubmission: true },
        { userEmail: 'social.worker@ngo.org', feedbackType: 'app', rating: 5, comment: 'We use this platform for our NGO blood camps. Very effective tool!', category: 'platform', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'grateful.son@gmail.com', feedbackType: 'donor', donor: donors[8]._id, rating: 5, comment: 'Ravi donated platelets for my mother. Very compassionate person.', category: 'experience', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'hospital.admin@gmail.com', feedbackType: 'app', rating: 4, comment: 'Good platform for connecting donors. Integration with hospital systems would be helpful.', category: 'suggestion', status: 'pending', isPublicSubmission: true },
        { userEmail: 'emergency.team@gmail.com', feedbackType: 'donor', donor: donors[3]._id, rating: 5, comment: 'Anjali helped during critical AB+ shortage. Very reliable!', category: 'experience', status: 'resolved', isPublicSubmission: true },
        { userEmail: 'patient.wife@gmail.com', feedbackType: 'app', rating: 5, comment: 'This platform is a blessing. Found blood for my husband\'s surgery easily.', category: 'experience', status: 'reviewed', isPublicSubmission: true },
        { userEmail: 'health.dept@gov.in', feedbackType: 'app', rating: 4, comment: 'Excellent initiative. Consider partnering with blood banks.', category: 'suggestion', status: 'pending', isPublicSubmission: true },
        { userEmail: 'thankful.mother@gmail.com', feedbackType: 'donor', donor: donors[7]._id, rating: 5, comment: 'Meera helped save my child\'s life. Forever grateful! 🙏❤️', category: 'experience', status: 'resolved', isPublicSubmission: true }
    ];

    const created = await Feedback.insertMany(feedbacks);
    console.log(`✅ Added ${created.length} feedback entries`);
}

async function seedDonationHistory(donors) {
    console.log('\n🩸 Seeding Donation History...');
    
    const donations = [];
    const hospitals = [
        { name: 'SCTIMST', city: 'Thiruvananthapuram' },
        { name: 'Aster Medcity', city: 'Kochi' },
        { name: 'MIMS Hospital', city: 'Kozhikode' },
        { name: 'Amrita Institute', city: 'Kochi' },
        { name: 'Medical Trust Hospital', city: 'Kochi' },
        { name: 'Baby Memorial', city: 'Kozhikode' },
        { name: 'Apollo Hospital', city: 'Bangalore' },
        { name: 'Manipal Hospital', city: 'Bangalore' },
        { name: 'Lisie Hospital', city: 'Kochi' },
        { name: 'KIMS Hospital', city: 'Thiruvananthapuram' }
    ];
    
    const donationTypes = ['whole-blood', 'plasma', 'platelets', 'whole-blood', 'whole-blood']; // More whole-blood
    const recipientNames = ['Rajesh Kumar', 'Lakshmi Devi', 'Mohammed Ali', 'Sunitha Menon', 'Baby Aisha', 'Kumar Swamy', 'Preethi Nair', null, null, null];

    // Create multiple donations for each donor
    for (const donor of donors.slice(0, 35)) {
        const donationCount = donor.totalDonations || Math.floor(Math.random() * 15) + 1;
        
        for (let i = 0; i < donationCount; i++) {
            const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
            const daysAgo = Math.floor(Math.random() * 180) + (i * 30); // Spread over 6 months
            const donationDate = new Date();
            donationDate.setDate(donationDate.getDate() - daysAgo);
            
            const donationType = donationTypes[Math.floor(Math.random() * donationTypes.length)];
            const quantity = donationType === 'whole-blood' ? 450 : donationType === 'plasma' ? 600 : 250;
            
            donations.push({
                donor: donor._id,
                donorName: `${donor.firstName} ${donor.lastName}`,
                bloodGroup: donor.bloodGroup,
                donationDate: donationDate,
                hospital: hospital.name,
                city: hospital.city,
                donationType: donationType,
                quantity: quantity,
                certificate: Math.random() > 0.3 ? `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : '',
                recipientName: Math.random() > 0.6 ? recipientNames[Math.floor(Math.random() * recipientNames.length)] : null,
                notes: Math.random() > 0.7 ? 'Emergency donation' : null
            });
        }
    }

    const created = await DonationHistory.insertMany(donations);
    console.log(`✅ Added ${created.length} donation records`);
}

async function seedInventory() {
    console.log('\n🏥 Seeding Blood Inventory...');
    
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const hospitals = [
        { name: 'SCTIMST', city: 'Thiruvananthapuram', phone: '+914712524266' },
        { name: 'Aster Medcity', city: 'Kochi', phone: '+914844001000' },
        { name: 'MIMS Hospital', city: 'Kozhikode', phone: '+914956228800' },
        { name: 'Amrita Institute', city: 'Kochi', phone: '+914842852100' },
        { name: 'Medical Trust Hospital', city: 'Kochi', phone: '+914842358001' },
        { name: 'Baby Memorial', city: 'Kozhikode', phone: '+914952353232' },
        { name: 'Apollo Hospital', city: 'Bangalore', phone: '+918026304050' },
        { name: 'Manipal Hospital', city: 'Bangalore', phone: '+918025021000' },
        { name: 'Lisie Hospital', city: 'Kochi', phone: '+914843055555' },
        { name: 'KIMS Hospital', city: 'Thiruvananthapuram', phone: '+914712446699' },
        { name: 'Jubilee Mission', city: 'Thrissur', phone: '+914872420001' },
        { name: 'SAT Hospital', city: 'Thiruvananthapuram', phone: '+914712304500' }
    ];

    const inventory = [];
    
    for (const hospital of hospitals) {
        for (const bloodGroup of bloodGroups) {
            // Vary quantity - some critical, some low, some available
            const baseQuantity = Math.random() > 0.8 ? 
                Math.floor(Math.random() * 500) + 100 :  // Critical/Low
                Math.floor(Math.random() * 3000) + 1000; // Available
            
            const units = Math.floor(baseQuantity / 450);
            const status = baseQuantity < 500 ? 'critical' : baseQuantity < 1500 ? 'low' : 'available';
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 30) + 5);
            
            const lastUpdated = new Date();
            lastUpdated.setDate(lastUpdated.getDate() - Math.floor(Math.random() * 5));
            
            inventory.push({
                bloodGroup: bloodGroup,
                hospital: hospital.name,
                city: hospital.city,
                contactNumber: hospital.phone,
                quantity: baseQuantity,
                unitsAvailable: units,
                status: status,
                expiryDate: expiryDate,
                lastUpdated: lastUpdated,
                notes: status === 'critical' ? 'Urgent replenishment needed' : null
            });
        }
    }

    const created = await BloodInventory.insertMany(inventory);
    console.log(`✅ Added ${created.length} inventory records`);
}

async function seedNotifications(donors) {
    console.log('\n🔔 Seeding Notifications...');
    
    const notifications = [];
    
    // Create notifications for first 20 donors
    for (const donor of donors.slice(0, 20)) {
        const notifCount = Math.floor(Math.random() * 5) + 2;
        
        const templates = [
            { type: 'emergency', title: '🚨 Emergency Blood Request', message: `${donor.bloodGroup} needed urgently at nearby hospital`, priority: 'high' },
            { type: 'match', title: '🎯 You Match an Emergency!', message: `Your blood group matches a critical request in ${donor.city}`, priority: 'high' },
            { type: 'thankyou', title: '❤️ Thank You for Donating', message: 'Your recent donation helped save a life!', priority: 'normal' },
            { type: 'reminder', title: '📅 Eligible to Donate Again', message: '90 days have passed. You can donate again!', priority: 'normal' },
            { type: 'milestone', title: '🎉 Milestone Achieved!', message: `Congratulations on ${donor.totalDonations} donations!`, priority: 'normal' },
            { type: 'urgent', title: '⚠️ Critical Blood Shortage', message: `${donor.bloodGroup} is critically low in ${donor.city} blood banks`, priority: 'high' },
            { type: 'appreciation', title: '🌟 You\'re a Life Saver!', message: 'Your donations have helped save multiple lives', priority: 'normal' }
        ];
        
        for (let i = 0; i < notifCount; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            
            notifications.push({
                recipient: donor._id,
                type: template.type,
                title: template.title,
                message: template.message,
                priority: template.priority,
                isRead: Math.random() > 0.3, // 70% read
                createdAt: createdAt
            });
        }
    }

    const created = await Notification.insertMany(notifications);
    console.log(`✅ Added ${created.length} notifications`);
}

async function showStatistics() {
    console.log('\n\n📊 DATABASE STATISTICS');
    console.log('='.repeat(50));
    
    const stats = {
        users: await User.countDocuments(),
        donors: await User.countDocuments({ role: 'donor' }),
        emergencies: await EmergencyRequest.countDocuments(),
        activeEmergencies: await EmergencyRequest.countDocuments({ status: 'active' }),
        feedback: await Feedback.countDocuments(),
        publicFeedback: await Feedback.countDocuments({ isPublicSubmission: true }),
        donations: await DonationHistory.countDocuments(),
        inventory: await BloodInventory.countDocuments(),
        notifications: await Notification.countDocuments()
    };
    
    console.log(`👥 Total Users: ${stats.users}`);
    console.log(`🩸 Donors: ${stats.donors}`);
    console.log(`🚨 Emergency Requests: ${stats.emergencies} (${stats.activeEmergencies} active)`);
    console.log(`💬 Feedback: ${stats.feedback} (${stats.publicFeedback} public)`);
    console.log(`📋 Donation Records: ${stats.donations}`);
    console.log(`🏥 Inventory Records: ${stats.inventory}`);
    console.log(`🔔 Notifications: ${stats.notifications}`);
    
    // Blood group distribution
    const bloodGroups = await User.aggregate([
        { $match: { role: 'donor' } },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    
    console.log('\n🩸 Blood Group Distribution:');
    bloodGroups.forEach(bg => console.log(`   ${bg._id}: ${bg.count} donors`));
    
    // Top cities
    const cities = await User.aggregate([
        { $match: { role: 'donor' } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);
    
    console.log('\n🏙️ Top 5 Cities:');
    cities.forEach(city => console.log(`   ${city._id}: ${city.count} donors`));
    
    console.log('\n' + '='.repeat(50));
}

async function main() {
    console.log('\n🚀 BLOODFINDER - COMPLETE DATABASE SEEDING');
    console.log('='.repeat(50));
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        await clearDatabase();
        
        const donors = await seedUsers();
        await seedEmergencyRequests();
        await seedFeedback(donors);
        await seedDonationHistory(donors);
        await seedInventory();
        await seedNotifications(donors);
        
        await showStatistics();
        
        console.log('\n✅ DATABASE SEEDING COMPLETE!');
        console.log('\n🎯 TEST CREDENTIALS:');
        console.log('   Admin: admin@bloodfinder.com / admin123');
        console.log('   Donor: arjun.nair@email.com / donor123');
        console.log('\n🚀 Start server: npm start');
        console.log('🌐 Visit: http://localhost:3001/admin.html\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB\n');
    }
}

main();
