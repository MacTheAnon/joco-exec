// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
const { SquareClient, SquareEnvironment } = require('square');
const express = require('express');
const mongoose = require('mongoose'); // DATABASE DRIVER
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const twilio = require('twilio'); 
require('dotenv').config();

// --- BIGINT FIX ---
// ⚠️ CHANGED: Return Number(this) instead of this.toString()
// This fixes the "EXPECTED_INTEGER" error from Square
BigInt.prototype.toJSON = function() { return Number(this); };

// --- SERVER CONSTANTS ---
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/joco_db')
  .then(() => console.log("✅ Connected to MongoDB Cloud"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS (MODELS)
// ==========================================

// USER MODEL (Drivers & Customers)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
    isApproved: { type: Boolean, default: false }, // Drivers need approval
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// BOOKING MODEL
const BookingSchema = new mongoose.Schema({
    squarePaymentId: String,
    userId: String, // Link to User ID
    name: String,
    email: String,
    phone: String,
    serviceType: { type: String, enum: ['distance', 'hourly'], default: 'distance' },
    vehicleType: String,
    pickup: String,
    dropoff: String,
    // --- NEW FIELD ---
    flightNumber: String,
    // -----------------
    stops: [Object], 
    pickupCoords: Object,
    dropoffCoords: Object,
    date: String,
    time: String,
    distance: String,
    duration: Number, // For hourly
    isRoundTrip: { type: Boolean, default: false },
    returnTime: Date,
    meetAndGreet: Boolean,
    totalCharged: Number, // Stored in Cents
    status: { type: String, default: 'PAID' }, // PAID, ASSIGNED, COMPLETED, CANCELLED
    driverId: String, // Assigned Driver
    driverLocation: {
        lat: Number,
        lng: Number,
        heading: Number,
        updatedAt: Date
    },
    bookedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// --- PRICING CONFIGURATION ---
const PRICING_CONFIG = {
    'Luxury Sedan':  { baseRate: 85,  perMileRate: 3.00, hourlyRate: 75 },
    'Luxury SUV':    { baseRate: 95,  perMileRate: 4.50, hourlyRate: 95 },
    'Night Out':     { baseRate: 150, perMileRate: 4.50, hourlyRate: 125 } 
};

const app = express();
app.use(cors());
app.use(express.json());

const squareClient = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// ==========================================
// 3. UTILITIES
// ==========================================

// Updated Pricing Logic
function calculatePrice(vehicleType, distanceMiles, serviceType, duration, isRoundTrip) {
    const config = PRICING_CONFIG[vehicleType];
    if (!config) throw new Error(`Pricing not configured for: ${vehicleType}`);

    // HOURLY LOGIC
    if (serviceType === 'hourly') {
        const hours = parseFloat(duration || 2);
        const hourlyTotal = hours * config.hourlyRate;
        return {
            quote: parseFloat(hourlyTotal.toFixed(2)),
            distance: 0,
            method: `Hourly Rate (${hours} hrs @ $${config.hourlyRate}/hr)`
        };
    }

    // DISTANCE LOGIC
    const miles = parseFloat(distanceMiles || 0);
    let mileageTotal = miles * config.perMileRate;
    let finalQuote = Math.max(config.baseRate, mileageTotal);

    if (isRoundTrip) {
        finalQuote = finalQuote * 1.8; // Round trip discount
    }

    return {
        quote: parseFloat(finalQuote.toFixed(2)),
        distance: miles.toFixed(2),
        method: mileageTotal > config.baseRate ? "Mileage Rate" : "Base Rate"
    };
}

// Apple Maps Tokens
const MAPS_TOKENS = {
    "www.jocoexec.com": "eyJraWQiOiI2VTgySkZDNlhUIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg0NjQ4LCJvcmlnaW4iOiJ3d3cuam9jb2V4ZWMuY29tIn0.-gPvMZbjh6DKKeTbEZP0QRgaEkxfA1X1jcO3ZZPenAzhhOd9t_gsBzaOxnGGTUaPQkl-2XbxoNpKOva-B8ZRCw",
    "default": "eyJraWQiOiJTVDZIRzI5SDJBIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg2NTA3LCJvcmlnaW4iOiIqLmpvY29leGVjLmNvbSJ9.in54tp2O2ZteVBOVkY2jUExdZ4o691DKx_UsMTlRU5XVeZOg8br4XCMDYsF_NrK8le2elwOGSHTh6dnEBJl2_A"
};

// ==========================================
// 4. API ROUTES
// ==========================================

app.get('/api/maps/token', (req, res) => {
    try {
        let requestDomain = req.headers.origin || req.headers.host || "";
        const cleanDomain = requestDomain.replace(/^https?:\/\//, '').split(':')[0].replace(/\/$/, '');
        let token = MAPS_TOKENS[cleanDomain] || MAPS_TOKENS["default"];
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Token retrieval failed" });
    }
});

app.post('/api/check-availability', async (req, res) => {
    try {
        const { date, time } = req.body;
        // Check MongoDB for existing booking
        const conflict = await Booking.findOne({ date, time, status: { $ne: 'CANCELLED' } });
        res.json({ available: !conflict });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/get-quote', (req, res) => {
    const { vehicleType, distance, serviceType, duration, isRoundTrip } = req.body;
    try {
        const result = calculatePrice(vehicleType, distance, serviceType, duration, isRoundTrip);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// --- AUTHENTICATION ROUTES (MONGODB) ---

app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, username, email,
            password: hashedPassword,
            role: role || 'customer',
            isApproved: role !== 'driver' 
        });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, isApproved: newUser.isApproved } });
    } catch (e) {
        res.status(500).json({ error: "Registration Failed" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const ADMIN_PASS = process.env.ADMIN_SECRET || 'JoC03x3c2026';

    // Master Admin Override
    if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === ADMIN_PASS) {
        const token = jwt.sign({ id: 'master-admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
        return res.json({ token, user: { name: 'Master Admin', role: 'admin', isApproved: true } });
    }

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
    } catch (e) {
        res.status(500).json({ error: "Login Error" });
    }
});

// --- PAYMENT & BOOKING ROUTE ---

app.post('/api/process-payment', async (req, res) => {
    const { sourceId, vehicleType, bookingDetails } = req.body;
    try {
        const distance = bookingDetails.distance === 'N/A (Hourly)' ? 0 : bookingDetails.distance;
        
        // 1. Calculate Price
        let pricing = calculatePrice(
            vehicleType, 
            distance, 
            bookingDetails.serviceType, 
            bookingDetails.hourlyDuration,
            bookingDetails.isRoundTrip
        );
        
        // Calculate Amount (Safe Math)
        let amountInCents = Math.round(pricing.quote * 100);

        // Add Meet & Greet Fee
        if (bookingDetails.meetAndGreet) {
            amountInCents += 2500; 
        }

        // 2. Process Square Payment
        // We use BigInt() here for the SDK, but the toJSON helper ensures it sends as a Number
        const response = await squareClient.payments.create({
            sourceId, 
            idempotencyKey: `sq_${Date.now()}`, 
            amountMoney: { 
                amount: BigInt(amountInCents), 
                currency: 'USD' 
            }
        });

        // 3. Save to MongoDB
        const newBooking = await Booking.create({
            squarePaymentId: response.result.payment.id,
            ...bookingDetails,
            totalCharged: amountInCents,
            status: 'PAID',
            bookedAt: new Date()
        });

        // 4. Notify Drivers
        const drivers = await User.find({ role: 'driver', isApproved: true });
        
        drivers.forEach(driver => {
            const jobDesc = bookingDetails.serviceType === 'hourly' 
                ? `HOURLY: ${bookingDetails.hourlyDuration} Hours`
                : `${bookingDetails.pickup} to ${bookingDetails.dropoff}`;

            transporter.sendMail({
                from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
                to: driver.email,
                subject: `NEW JOB: ${newBooking.date}`,
                html: `<p>New Job: ${jobDesc}</p><p>Fare: $${(amountInCents/100).toFixed(2)}</p>`
            }).catch(e => console.error("Email Error:", e.message));

            if (process.env.TWILIO_PHONE) {
                twilioClient.messages.create({
                    body: `JOCO EXEC: New job available. ${jobDesc}`,
                    from: process.env.TWILIO_PHONE,
                    to: driver.phone
                }).catch(e => console.error("SMS Error:", e.message));
            }
        });

        res.json({ success: true, paymentId: response.result.payment.id });

    } catch (e) { 
        console.error("PAYMENT ERROR:", e); 
        // Send a readable error to the client
        const errorMessage = e.result 
            ? JSON.stringify(e.result.errors) 
            : (e.message || "Payment Processing Failed");
            
        res.status(500).json({ error: errorMessage }); 
    }
});

// --- DRIVER TRACKING ---
app.post('/api/driver/update-location', async (req, res) => {
    const { bookingId, lat, lng, heading } = req.body;
    try {
        await Booking.findByIdAndUpdate(bookingId, {
            driverLocation: { lat, lng, heading, updatedAt: new Date() }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Update failed" });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', async (req, res) => res.json(await Booking.find().sort({ bookedAt: -1 })));
app.get('/api/admin/users', async (req, res) => res.json(await User.find()));

app.post('/api/admin/approve-driver', async (req, res) => {
    await User.findOneAndUpdate({ email: req.body.email }, { isApproved: true });
    res.json({ success: true });
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ==========================================
// 5. PRODUCTION SERVING
// ==========================================
const clientBuildPath = path.join(__dirname, 'client', 'build');
const rootBuildPath = path.join(__dirname, 'build');

if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
} else if (fs.existsSync(rootBuildPath)) {
    app.use(express.static(rootBuildPath));
}

app.use('/api', (req, res) => res.status(404).json({ error: "API route not found" }));

app.use((req, res) => {
    const target = fs.existsSync(clientBuildPath) ? clientBuildPath : rootBuildPath;
    res.sendFile(path.join(target, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JOCO EXEC Server Online (MongoDB Active)`);
    console.log(`🚀 Port: ${PORT}`);
});