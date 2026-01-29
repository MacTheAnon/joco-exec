// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
const { SquareClient, SquareEnvironment } = require('square');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const twilio = require('twilio'); 
require('dotenv').config();

// --- CRITICAL FIX: Square BigInt Error ---
BigInt.prototype.toJSON = function() { return Number(this); };

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/joco_db')
  .then(() => console.log("✅ Connected to MongoDB Cloud"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS
// ==========================================

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String, 
    role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
    squarePaymentId: String,
    userId: String, 
    name: String,
    email: String,
    phone: String,
    serviceType: { type: String, enum: ['distance', 'hourly'], default: 'distance' },
    vehicleType: String,
    pickup: String,
    dropoff: String,
    flightNumber: String,
    stops: [Object], 
    pickupCoords: Object,
    dropoffCoords: Object,
    date: String,
    time: String,
    distance: String,
    duration: Number,
    isRoundTrip: { type: Boolean, default: false },
    returnTime: Date,
    meetAndGreet: Boolean,
    totalCharged: Number, // Stored in Cents
    status: { type: String, default: 'PAID' },
    driverId: String, // Assigned Driver ID
    bookedAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

const PRICING_CONFIG = {
    'Luxury Sedan':  { baseRate: 85,  perMileRate: 3.00, hourlyRate: 75 },
    'Luxury SUV':    { baseRate: 95,  perMileRate: 4.50, hourlyRate: 95 },
    'Night Out':     { baseRate: 150, perMileRate: 4.50, hourlyRate: 125 } 
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const squareClient = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
});

// --- ⚠️ HARDCODED CREDENTIALS (NUCLEAR FIX) ---
// Using the new token you provided: c7408d...
const twilioClient = twilio(
  "AC7d8f7e1f30d44152be1365d7398d918d".trim(), 
  "c7408d72d82a32f25b0d52844cd49f93".trim() 
);

// ==========================================
// 3. UTILITIES & MIDDLEWARE
// ==========================================

function calculatePrice(vehicleType, distanceMiles, serviceType, duration, isRoundTrip) {
    const config = PRICING_CONFIG[vehicleType];
    if (!config) throw new Error(`Pricing not configured for: ${vehicleType}`);

    if (serviceType === 'hourly') {
        const hours = parseFloat(duration || 2);
        return { quote: parseFloat((hours * config.hourlyRate).toFixed(2)), distance: 0 };
    }

    const miles = parseFloat(distanceMiles || 0);
    let mileageTotal = miles * config.perMileRate;
    let finalQuote = Math.max(config.baseRate, mileageTotal);
    if (isRoundTrip) finalQuote = finalQuote * 1.8;

    return { quote: parseFloat(finalQuote.toFixed(2)), distance: miles.toFixed(2) };
}

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const MAPS_TOKENS = {
    "www.jocoexec.com": "eyJraWQiOiI2VTgySkZDNlhUIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg0NjQ4LCJvcmlnaW4iOiJ3d3cuam9jb2V4ZWMuY29tIn0.-gPvMZbjh6DKKeTbEZP0QRgaEkxfA1X1jcO3ZZPenAzhhOd9t_gsBzaOxnGGTUaPQkl-2XbxoNpKOva-B8ZRCw",
    "default": "eyJraWQiOiJTVDZIRzI5SDJBIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg2NTA3LCJvcmlnaW4iOiIqLmpvY29leGVjLmNvbSJ9.in54tp2O2ZteVBOVkY2jUExdZ4o691DKx_UsMTlRU5XVeZOg8br4XCMDYsF_NrK8le2elwOGSHTh6dnEBJl2_A"
};

// ==========================================
// 4. API ROUTES
// ==========================================

app.get('/api/maps/token', (req, res) => {
    let domain = (req.headers.origin || "").replace(/^https?:\/\//, '').split(':')[0].replace(/\/$/, '');
    res.json({ token: MAPS_TOKENS[domain] || MAPS_TOKENS["default"] });
});

app.post('/api/check-availability', async (req, res) => {
    try {
        const { date, time } = req.body;
        const conflict = await Booking.findOne({ date, time, status: { $ne: 'CANCELLED' } });
        res.json({ available: !conflict });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/get-quote', (req, res) => {
    try {
        res.json(calculatePrice(req.body.vehicleType, req.body.distance, req.body.serviceType, req.body.duration, req.body.isRoundTrip));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, email, password, role, phone } = req.body; 
        if (await User.findOne({ $or: [{ email }, { username }] })) return res.status(400).json({ error: "User exists." });
        
        const newUser = await User.create({
            name, username, email, phone, 
            password: await bcrypt.hash(password, 10),
            role: role || 'customer', isApproved: role !== 'driver'
        });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, isApproved: newUser.isApproved } });
    } catch (e) { res.status(500).json({ error: "Registration Failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    if ((identifier === 'admin' || identifier.includes('kalebm')) && password === (process.env.ADMIN_SECRET || 'JoC03x3c2026')) {
        const token = jwt.sign({ id: 'master-admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
        return res.json({ token, user: { name: 'Admin', role: 'admin', isApproved: true } });
    }
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
    } catch (e) { res.status(500).json({ error: "Login Error" }); }
});

// --- PAYMENT ROUTE ---
app.post('/api/process-payment', async (req, res) => {
    try {
        const { sourceId, vehicleType, bookingDetails } = req.body;
        const distance = bookingDetails.distance === 'N/A (Hourly)' ? 0 : bookingDetails.distance;
        
        let pricing = calculatePrice(vehicleType, distance, bookingDetails.serviceType, bookingDetails.hourlyDuration, bookingDetails.isRoundTrip);
        let amountInCents = Math.round(pricing.quote * 100);
        if (bookingDetails.meetAndGreet) amountInCents += 2500;

        const response = await squareClient.payments.create({
            sourceId, idempotencyKey: `sq_${Date.now()}`,
            amountMoney: { amount: BigInt(amountInCents), currency: 'USD' }
        });

        const paymentId = response.result?.payment?.id || response.payment?.id || response.body?.payment?.id;
        if (!paymentId) throw new Error("Payment ID missing");

        const newBooking = await Booking.create({
            squarePaymentId: paymentId, ...bookingDetails, totalCharged: amountInCents, status: 'PAID'
        });

        try {
            const drivers = await User.find({ role: 'driver', isApproved: true });
            drivers.forEach(d => {
                transporter.sendMail({
                    from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, to: d.email,
                    subject: `NEW JOB Available`, html: `<p>New Job Available: $${(amountInCents/100).toFixed(2)}</p>`
                }).catch(() => {});
            });
        } catch (e) {}

        res.json({ success: true, paymentId });
    } catch (e) { res.status(500).json({ error: "Payment Failed" }); }
});

// ✅ DRIVER & USER ROUTES
app.get('/api/user/my-bookings', authenticateToken, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'driver') {
            query = { driverId: req.user.id };
        } else {
            query = { userId: req.user.id };
        }
        
        const bookings = await Booking.find(query).sort({ bookedAt: -1 });
        const safeBookings = bookings.map(b => ({
            ...b.toObject(),
            amount: b.totalCharged,
            id: b._id
        }));
        res.json(safeBookings);
    } catch (e) { res.status(500).json({ error: "Fetch error" }); }
});

app.post('/api/driver/update-location', async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.body.bookingId, {
            driverLocation: { lat: req.body.lat, lng: req.body.lng, heading: req.body.heading, updatedAt: new Date() }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Update failed" }); }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', async (req, res) => {
    const bookings = await Booking.find().sort({ bookedAt: -1 });
    const safeBookings = bookings.map(b => ({ ...b.toObject(), amount: b.totalCharged, id: b._id }));
    res.json(safeBookings);
});

app.get('/api/admin/users', async (req, res) => res.json(await User.find()));

app.post('/api/admin/approve-driver', async (req, res) => {
    await User.findOneAndUpdate({ email: req.body.email }, { isApproved: true });
    res.json({ success: true });
});

app.post('/api/admin/update-phone', async (req, res) => {
    try {
        const { userId, phone } = req.body;
        await User.findByIdAndUpdate(userId, { phone });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.post('/api/admin/assign-driver', async (req, res) => {
    try {
        const { bookingId, driverId } = req.body;
        const booking = await Booking.findByIdAndUpdate(bookingId, { 
            driverId: driverId, 
            status: driverId ? 'ASSIGNED' : 'PAID' 
        }, { new: true });

        if (driverId) {
            const driver = await User.findById(driverId);
            if (driver && driver.email) {
                 transporter.sendMail({
                    from: `"JOCO DISPATCH" <${process.env.EMAIL_USER}>`,
                    to: driver.email,
                    subject: `TRIP ASSIGNED: ${booking.date}`,
                    html: `<p>You have been assigned a trip.</p><p><strong>Pickup:</strong> ${booking.pickup}</p><p><strong>Time:</strong> ${booking.time}</p>`
                }).catch(e => console.error("Email fail:", e));
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Assignment failed" });
    }
});

app.post('/api/admin/dispatch-radio', async (req, res) => {
    try {
        const { driverId, message } = req.body;
        if (!message) return res.status(400).json({ error: "No message provided" });

        const driver = await User.findById(driverId);
        if (!driver || !driver.phone) return res.status(400).json({ error: "Driver has no phone number" });

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({ voice: 'alice' }, `Dispatch Message: ${message}`);
        twiml.pause({ length: 1 });
        twiml.say({ voice: 'alice' }, "Repeating: " + message);

        await twilioClient.calls.create({
            twiml: twiml.toString(),
            to: driver.phone,
            from:"+18558121783" // ✅ Hardcoded Phone
        });

        res.json({ success: true, message: "Dispatch sent" });
    } catch (error) {
        console.error("Dispatch Error:", error);
        res.status(500).json({ error: error.message || "Radio Dispatch Failed" });
    }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') return res.status(400).json({ error: "Invalid ID provided" });
        
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) return res.status(404).json({ error: "Booking not found" });

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Delete Route
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// ==========================================
// 5. PRODUCTION SERVING
// ==========================================
const clientPath = path.join(__dirname, 'client', 'build');
app.use(express.static(clientPath));

app.use('/api', (req, res) => res.status(404).json({ error: "API route not found" }));

// Catch-All Regex
app.get(/.*/, (req, res) => res.sendFile(path.join(clientPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server Running on Port ${PORT}`));