// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
const { SquareClient, SquareEnvironment } = require('square');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Security headers
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const axios = require('axios'); // Required for Google Maps
require('dotenv').config();

// --- BIGINT FIX (CRITICAL FOR NEW SQUARE SDK) ---
// The new Square SDK uses "BigInt" for money. 
// JSON.stringify crashes on BigInt, so we add this helper.
BigInt.prototype.toJSON = function() { return this.toString(); };

// --- SERVER CONSTANTS ---
const BASE_URL = 'https://www.jocoexec.com';
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

// --- FILE PATHS ---
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// --- PRICING CONFIGURATION ---
// This handles ALL vehicle types in one config
const PRICING_CONFIG = {
    'Luxury Sedan':  { baseRate: 85,  perMileRate: 3.00 },
    'Luxury SUV':    { baseRate: 115, perMileRate: 4.50 },
    'Sprinter':      { baseRate: 150, perMileRate: 6.00 },
    'Executive Bus': { baseRate: 250, perMileRate: 10.00 }
};

console.log(`🚀 CONFIG: Server targeting ${BASE_URL} on PORT ${PORT}`);

// ==========================================
// 2. CLIENT INITIALIZATION
// ==========================================

const app = express();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

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

// ==========================================
// 3. MIDDLEWARE SETUP
// ==========================================

// Security Headers (Helmet)
app.use(helmet()); 
app.disable('x-powered-by'); 

// CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://www.jocoexec.com' : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

// --- DATABASE HELPERS ---
const getBookings = () => {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
};

const saveBooking = (b) => {
    const current = getBookings();
    fs.writeFileSync(DB_FILE, JSON.stringify([...current, b], null, 2));
};

const getUsers = () => {
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
};

const saveUser = (u) => {
    const current = getUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify([...current, u], null, 2));
};

// --- PRICING HELPER (Dynamic Logic) ---
// This replaces 'calculateSedanQuote' with a universal function for ALL vehicles.
async function calculateDynamicQuote(vehicleType, pickupAddress, dropoffAddress) {
    const config = PRICING_CONFIG[vehicleType];
    
    // Fallback if vehicle type isn't in config
    if (!config) {
        throw new Error(`Pricing not configured for vehicle type: ${vehicleType}`);
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: pickupAddress,
                destinations: dropoffAddress,
                units: 'imperial',
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        const distanceData = response.data.rows[0].elements[0];
        
        if (!distanceData || distanceData.status !== "OK") {
             // Fallback for short trips or address errors: Just return Base Rate
             console.warn("Distance Matrix Warning: Could not calculate distance. Using Base Rate.");
             return { quote: config.baseRate, distance: 0, vehicle: vehicleType, method: "Fallback Base Rate" };
        }

        // Convert meters to miles (1 mile = 1609.34 meters)
        const distanceInMiles = distanceData.distance.value / 1609.34;
        const mileageQuote = distanceInMiles * config.perMileRate;

        // "Whichever is higher" logic
        const finalQuote = Math.max(config.baseRate, mileageQuote);

        return {
            quote: parseFloat(finalQuote.toFixed(2)),
            distance: distanceInMiles.toFixed(2),
            vehicle: vehicleType,
            method: mileageQuote > config.baseRate ? "Mileage Rate" : "Base Rate"
        };
    } catch (error) {
        console.error("Pricing API Error:", error.message);
        return { quote: config.baseRate, error: "Calculation failed, using base rate." };
    }
}

// ==========================================
// 5. API ROUTES
// ==========================================

// --- CHECK AVAILABILITY ---
app.post('/api/check-availability', (req, res) => {
    try {
        const { date, time } = req.body;
        const bookings = getBookings();
        const isTaken = bookings.some(b => b.date === date && b.time === time);
        console.log(`🔍 Check: ${date} @ ${time} is ${isTaken ? 'TAKEN' : 'AVAILABLE'}`);
        res.json({ available: !isTaken });
    } catch (err) {
        console.error("Availability Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- GET INSTANT QUOTE (New Route) ---
app.post('/api/get-quote', async (req, res) => {
    const { vehicleType, pickup, dropoff } = req.body;
    try {
        const result = await calculateDynamicQuote(vehicleType, pickup, dropoff);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// --- LOGIN ---
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    
    // Use Environment Variable for Admin Password if available
    const ADMIN_PASS = process.env.ADMIN_SECRET || 'JoC03x3c2026';

    if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === ADMIN_PASS) {
        console.log("👑 MASTER ADMIN LOGGED IN");
        const token = jwt.sign({ id: 'master-admin', email: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
        return res.json({ 
            token, 
            user: { name: 'Master Admin', role: 'admin', email: 'admin@internal', isApproved: true } 
        });
    }

    const users = getUsers();
    const user = users.find(u => u.email === identifier || u.username === identifier);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

// --- REGISTER ---
app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password, role, companyName } = req.body;
    
    if (role === 'admin') return res.status(403).json({ error: "Restricted role." });

    const users = getUsers();
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ error: "Email or Username already taken." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        id: Date.now().toString(), 
        name, 
        username, 
        email, 
        companyName: companyName || null,
        password: hashedPassword, 
        role: role || 'customer',
        isApproved: role === 'driver' ? false : true 
    };
    
    saveUser(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

// --- PROCESS PAYMENT (Updated for Dynamic Pricing) ---
app.post('/api/process-payment', async (req, res) => {
    const { sourceId, vehicleType, pickup, dropoff, bookingDetails } = req.body;
  
    try {
        // 1. Calculate Price on Backend (Secure)
        // If pickup/dropoff provided, we verify price. If not, we fall back to bookingDetails.amount (unsafe but legacy compatible)
        let amountInCents;
        let pricingResult = {};

        if (vehicleType && pickup && dropoff) {
            pricingResult = await calculateDynamicQuote(vehicleType, pickup, dropoff);
            amountInCents = BigInt(Math.round(pricingResult.quote * 100));
        } else if (req.body.amount) {
            // Legacy support if frontend sends raw amount
            amountInCents = BigInt(req.body.amount);
        } else {
            throw new Error("Missing pricing details.");
        }

        // 2. Add Meet & Greet if selected ($25.00)
        if (bookingDetails && bookingDetails.meetAndGreet) {
            amountInCents += BigInt(2500); 
        }

        // 3. Call Square API
        const response = await squareClient.payments.create({
            sourceId, 
            idempotencyKey: Date.now().toString(), // Use UUID in prod if possible
            amountMoney: { amount: amountInCents, currency: 'USD' }
        });

        // 4. Save to Local DB
        const newBooking = { 
            id: response.result.payment.id, 
            ...bookingDetails, 
            totalCharged: Number(amountInCents),
            quoteDetails: pricingResult,
            status: 'PAID',
            driver: null, 
            bookedAt: new Date() 
        };
        saveBooking(newBooking);
        
        // 5. Email Dispatch (Notify Drivers)
        const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);
        approvedDrivers.forEach(async (driver) => {
            transporter.sendMail({
                from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
                to: driver.email,
                subject: `NEW JOB: ${newBooking.date}`,
                html: `
                    <h3>New Job Available</h3>
                    <p>Date: ${newBooking.date} @ ${newBooking.time}</p>
                    <p>Route: ${pickup} ➔ ${dropoff}</p>
                    <p>Vehicle: ${vehicleType}</p>
                    <p>Login to claim: <a href="${BASE_URL}/login">${BASE_URL}/login</a></p>
                `
            }).catch(e => console.error("Email Error:", e.message));
        });

        // 6. Send Success Response
        res.json({ success: true, paymentId: response.result.payment.id });

    } catch (e) { 
        console.error("Payment Error:", e);
        const errorMsg = e.errors ? e.errors[0].detail : (e.message || "Payment Processing Failed");
        res.status(500).json({ error: errorMsg }); 
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', (req, res) => res.json(getBookings()));
app.get('/api/admin/users', (req, res) => res.json(getUsers()));

app.post('/api/admin/approve-driver', (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const updatedUsers = users.map(u => {
        if (u.email === email && u.role === 'driver') {
            return { ...u, isApproved: true };
        }
        return u;
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
    res.json({ success: true });
});

app.delete('/api/admin/bookings/:id', (req, res) => {
    const { id } = req.params;
    const bookings = getBookings();
    const newBookings = bookings.filter(b => b.id !== id);
    fs.writeFileSync(DB_FILE, JSON.stringify(newBookings, null, 2));
    res.json({ success: true });
});

// ==========================================
// 6. FRONTEND & START SERVER
// ==========================================

// Serve Frontend (Must be last)
app.use(express.static(path.join(__dirname, 'build')));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JOCO EXEC running on port ${PORT}`);
    console.log(`🔗 Network: ${BASE_URL}`);
});