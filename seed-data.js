// BloodFinder Database Operations Script - Indian Sample Data
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodfinder';

// Import schemas
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

const User = mongoose.model('User', userSchema);
const EmergencyRequest = mongoose.model('EmergencyRequest', emergencySchema);

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

async function addIndianSampleData() {
    console.log('\n🇮🇳 Adding Indian Sample Data...');
    
    const indianDonors = [
        {
            firstName: 'Arjun',
            lastName: 'Nair',
            email: 'arjun.nair@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543210',
            age: 28,
            role: 'donor',
            bloodGroup: 'O+',
            city: 'Thiruvananthapuram',
            address: 'TC 15/2847, Pattom, Thiruvananthapuram, Kerala',
            isAvailable: true,
            totalDonations: 12
        },
        {
            firstName: 'Priya',
            lastName: 'Menon',
            email: 'priya.menon@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543211',
            age: 25,
            role: 'donor',
            bloodGroup: 'A+',
            city: 'Kochi',
            address: 'Marine Drive, Ernakulam, Kochi, Kerala',
            isAvailable: true,
            totalDonations: 8
        },
        {
            firstName: 'Rahul',
            lastName: 'Pillai',
            email: 'rahul.pillai@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543212',
            age: 32,
            role: 'donor',
            bloodGroup: 'B+',
            city: 'Kozhikode',
            address: 'Mavoor Road, Kozhikode, Kerala',
            isAvailable: true,
            totalDonations: 15
        },
        {
            firstName: 'Anjali',
            lastName: 'Krishnan',
            email: 'anjali.k@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543213',
            age: 29,
            role: 'donor',
            bloodGroup: 'AB+',
            city: 'Thrissur',
            address: 'Swaraj Round, Thrissur, Kerala',
            isAvailable: true,
            totalDonations: 6
        },
        {
            firstName: 'Vivek',
            lastName: 'Sharma',
            email: 'vivek.sharma@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543214',
            age: 26,
            role: 'donor',
            bloodGroup: 'O-',
            city: 'Mumbai',
            address: 'Bandra West, Mumbai, Maharashtra',
            isAvailable: true,
            totalDonations: 10
        },
        {
            firstName: 'Sneha',
            lastName: 'Reddy',
            email: 'sneha.reddy@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543215',
            age: 27,
            role: 'donor',
            bloodGroup: 'A-',
            city: 'Bangalore',
            address: 'Koramangala, Bangalore, Karnataka',
            isAvailable: true,
            totalDonations: 9
        },
        {
            firstName: 'Kiran',
            lastName: 'Kumar',
            email: 'kiran.kumar@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543216',
            age: 30,
            role: 'donor',
            bloodGroup: 'B-',
            city: 'Kottayam',
            address: 'MC Road, Kottayam, Kerala',
            isAvailable: true,
            totalDonations: 7
        },
        {
            firstName: 'Meera',
            lastName: 'Warrier',
            email: 'meera.warrier@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543217',
            age: 24,
            role: 'donor',
            bloodGroup: 'AB-',
            city: 'Alappuzha',
            address: 'Boat Jetty Road, Alappuzha, Kerala',
            isAvailable: true,
            totalDonations: 4
        },
        {
            firstName: 'Ravi',
            lastName: 'Patel',
            email: 'ravi.patel@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543218',
            age: 33,
            role: 'donor',
            bloodGroup: 'O+',
            city: 'Ahmedabad',
            address: 'SG Highway, Ahmedabad, Gujarat',
            isAvailable: true,
            totalDonations: 11
        },
        {
            firstName: 'Deepika',
            lastName: 'Singh',
            email: 'deepika.singh@email.com',
            password: await bcryptjs.hash('password123', 10),
            phone: '+919876543219',
            age: 26,
            role: 'donor',
            bloodGroup: 'A+',
            city: 'Delhi',
            address: 'Connaught Place, New Delhi',
            isAvailable: true,
            totalDonations: 5
        }
    ];

    const indianEmergencies = [
        {
            patientName: 'Rajesh Kumar',
            bloodGroup: 'O-',
            hospital: 'SCTIMST, Thiruvananthapuram',
            contactNumber: '+919876501001',
            urgencyLevel: 'critical',
            city: 'Thiruvananthapuram',
            additionalNotes: 'Major surgery scheduled, universal donor needed urgently',
            status: 'active'
        },
        {
            patientName: 'Lakshmi Devi',
            bloodGroup: 'AB+',
            hospital: 'Aster Medcity, Kochi',
            contactNumber: '+919876501002',
            urgencyLevel: 'high',
            city: 'Kochi',
            additionalNotes: 'Cardiac surgery patient, needs blood within 2 hours',
            status: 'active'
        },
        {
            patientName: 'Mohammed Ali',
            bloodGroup: 'B+',
            hospital: 'MIMS Hospital, Kozhikode',
            contactNumber: '+919876501003',
            urgencyLevel: 'medium',
            city: 'Kozhikode',
            additionalNotes: 'Accident victim, stable condition',
            status: 'active'
        },
        {
            patientName: 'Sunitha Menon',
            bloodGroup: 'A+',
            hospital: 'Amrita Institute, Kochi',
            contactNumber: '+919876501004',
            urgencyLevel: 'critical',
            city: 'Kochi',
            additionalNotes: 'Emergency cesarean, mother and baby need immediate attention',
            status: 'active'
        },
        {
            patientName: 'Ramesh Babu',
            bloodGroup: 'O+',
            hospital: 'Apollo Hospital, Bangalore',
            contactNumber: '+919876501005',
            urgencyLevel: 'high',
            city: 'Bangalore',
            additionalNotes: 'Cancer patient undergoing chemotherapy',
            status: 'active'
        }
    ];

    try {
        // Add donors
        console.log('\n👥 Adding Indian donors...');
        let addedDonors = 0;
        for (const donorData of indianDonors) {
            try {
                const existingUser = await User.findOne({ email: donorData.email });
                if (!existingUser) {
                    const donor = new User(donorData);
                    await donor.save();
                    console.log(`✅ Added donor: ${donorData.firstName} ${donorData.lastName} from ${donorData.city}`);
                    addedDonors++;
                } else {
                    console.log(`⚠️ Donor already exists: ${donorData.email}`);
                }
            } catch (error) {
                console.log(`❌ Error adding donor ${donorData.firstName}: ${error.message}`);
            }
        }

        // Add emergency requests
        console.log('\n🚨 Adding Indian emergency requests...');
        let addedEmergencies = 0;
        for (const emergencyData of indianEmergencies) {
            try {
                const emergency = new EmergencyRequest(emergencyData);
                await emergency.save();
                console.log(`✅ Added emergency: ${emergencyData.patientName} needs ${emergencyData.bloodGroup} at ${emergencyData.hospital}`);
                addedEmergencies++;
            } catch (error) {
                console.log(`❌ Error adding emergency: ${error.message}`);
            }
        }

        console.log(`\n🎉 Successfully added ${addedDonors} Indian donors and ${addedEmergencies} emergency requests!`);

    } catch (error) {
        console.error('❌ Error adding sample data:', error);
    }
}

async function showIndianStats() {
    console.log('\n📊 INDIAN BLOODFINDER STATISTICS');
    console.log('=================================');

    try {
        // Get all donors
        const donors = await User.find({ role: 'donor' });
        const emergencies = await EmergencyRequest.find({ status: 'active' });

        console.log(`Total Donors: ${donors.length}`);
        console.log(`Active Emergency Requests: ${emergencies.length}`);

        // Kerala donors count
        const keralaDonors = donors.filter(donor => 
            ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kottayam', 'Alappuzha', 'Kannur', 'Kollam', 'Palakkad'].includes(donor.city)
        );
        console.log(`🌴 Kerala Donors: ${keralaDonors.length}`);

        // Blood group distribution
        const bloodGroups = {};
        donors.forEach(donor => {
            bloodGroups[donor.bloodGroup] = (bloodGroups[donor.bloodGroup] || 0) + 1;
        });

        console.log('\n🩸 Blood Group Distribution:');
        Object.entries(bloodGroups).forEach(([group, count]) => {
            console.log(`   ${group}: ${count} donors`);
        });

        // City distribution
        const cities = {};
        donors.forEach(donor => {
            cities[donor.city] = (cities[donor.city] || 0) + 1;
        });

        console.log('\n🏙️ City Distribution:');
        Object.entries(cities)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([city, count]) => {
                const flag = ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kottayam', 'Alappuzha'].includes(city) ? '🌴' : '🏙️';
                console.log(`   ${flag} ${city}: ${count} donors`);
            });

        // Emergency urgency
        const urgencyLevels = {};
        emergencies.forEach(emergency => {
            urgencyLevels[emergency.urgencyLevel] = (urgencyLevels[emergency.urgencyLevel] || 0) + 1;
        });

        console.log('\n🚨 Emergency Urgency Levels:');
        Object.entries(urgencyLevels).forEach(([level, count]) => {
            const icon = level === 'critical' ? '🔴' : level === 'high' ? '🟡' : '🟢';
            console.log(`   ${icon} ${level}: ${count} requests`);
        });

        // Find Kerala emergencies
        const keralaEmergencies = emergencies.filter(emergency => 
            ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kottayam', 'Alappuzha'].includes(emergency.city)
        );

        if (keralaEmergencies.length > 0) {
            console.log('\n🌴 KERALA EMERGENCY REQUESTS:');
            keralaEmergencies.forEach(emergency => {
                console.log(`   🚨 ${emergency.patientName} (${emergency.bloodGroup}) at ${emergency.hospital}, ${emergency.city}`);
                console.log(`      Contact: ${emergency.contactNumber} | Urgency: ${emergency.urgencyLevel}`);
            });
        }

    } catch (error) {
        console.error('❌ Error getting statistics:', error);
    }
}

async function main() {
    console.log('🇮🇳 BLOODFINDER INDIA - SAMPLE DATA SETUP');
    console.log('==========================================');

    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        await addIndianSampleData();
        await showIndianStats();

        console.log('\n🎯 NEXT STEPS:');
        console.log('==============');
        console.log('1. Start your server: node server.js');
        console.log('2. Visit: http://localhost:3000');
        console.log('3. Test search with Kerala cities like "Thiruvananthapuram", "Kochi", "Kozhikode"');
        console.log('4. Try blood group searches: O+, A+, B+, AB+, O-, A-, B-, AB-');
        console.log('5. Create emergency requests for Indian cities');
        console.log('6. Use interactive database: node interactive-db.js');

    } catch (error) {
        console.error('❌ Error in main execution:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { addIndianSampleData, showIndianStats };