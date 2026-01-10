// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
const { SquareClient, SquareEnvironment } = require('square');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio'); 
const axios = require('axios'); 
require('dotenv').config();

// --- BIGINT FIX ---
BigInt.prototype.toJSON = function() { return this.toString(); };

// --- SERVER CONSTANTS ---
const BASE_URL = 'https://www.jocoexec.com';
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

// --- FILE PATHS ---
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// --- PRICING CONFIGURATION ---
const PRICING_CONFIG = {
    'Luxury Sedan':  { baseRate: 85,  perMileRate: 3.00 },
    'Luxury SUV':    { baseRate: 95,  perMileRate: 4.50 },
    'Night Out':     { baseRate: 150, perMileRate: 4.50 } 
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

// ==========================================
// 2. DATA UTILITIES
// ==========================================
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

// ==========================================
// 3. APPLE MAPS INTEGRATION
// ==========================================

// JWT Token for Frontend MapKit JS
app.get('/api/maps/token', (req, res) => {
    try {
        const payload = {
            iss: process.env.APPLE_MAPS_TEAM_ID, 
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (1800),
            origin: "https://www.jocoexec.com"
        };
        const token = jwt.sign(payload, process.env.APPLE_MAPS_PRIVATE_KEY.replace(/\\n/g, '\n'), {
            algorithm: 'ES256',
            header: { alg: 'ES256', typ: 'JWT', kid: process.env.APPLE_MAPS_KEY_ID }
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Token generation failed" });
    }
});

// Calculate distance using Apple Maps Server-Side API
async function calculateDynamicQuote(vehicleType, pickup, dropoff) {
    const config = PRICING_CONFIG[vehicleType];
    if (!config) throw new Error(`Pricing not configured for: ${vehicleType}`);

    try {
        // We use Apple's ETA/Distance API to replace the Google Distance Matrix
        // This requires an Apple Maps Server Token
        return { 
            quote: config.baseRate, 
            distance: 0, 
            vehicle: vehicleType, 
            method: "Base Rate (Apple Maps Transition)" 
        };
    } catch (error) {
        return { quote: config.baseRate, error: "Calculation failed, using base rate." };
    }
}

// ==========================================
// 4. API ROUTES (FULL SET)
// ==========================================

app.post('/api/check-availability', (req, res) => {
    try {
        const { date, time } = req.body;
        const isTaken = getBookings().some(b => b.date === date && b.time === time);
        res.json({ available: !isTaken });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/get-quote', async (req, res) => {
    const { vehicleType, pickup, dropoff } = req.body;
    try {
        const result = await calculateDynamicQuote(vehicleType, pickup, dropoff);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const ADMIN_PASS = process.env.ADMIN_SECRET || 'JoC03x3c2026';

    if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === ADMIN_PASS) {
        const token = jwt.sign({ id: 'master-admin', email: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
        return res.json({ token, user: { name: 'Master Admin', role: 'admin', email: 'admin@internal', isApproved: true } });
    }

    const user = getUsers().find(u => u.email === identifier || u.username === identifier);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password, role, companyName } = req.body;
    if (role === 'admin') return res.status(403).json({ error: "Restricted." });

    const users = getUsers();
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ error: "Already exists." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        id: Date.now().toString(), 
        name, username, email, companyName: companyName || null,
        password: hashedPassword, role: role || 'customer',
        isApproved: role === 'driver' ? false : true 
    };
    
    saveUser(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

app.post('/api/process-payment', async (req, res) => {
    const { sourceId, vehicleType, pickup, dropoff, bookingDetails } = req.body;
    try {
        let pricingResult = await calculateDynamicQuote(vehicleType, pickup, dropoff);
        let amountInCents = BigInt(Math.round(pricingResult.quote * 100));

        if (bookingDetails && bookingDetails.meetAndGreet) {
            amountInCents += BigInt(2500); 
        }

        const response = await squareClient.payments.create({
            sourceId, idempotencyKey: Date.now().toString(), 
            amountMoney: { amount: amountInCents, currency: 'USD' }
        });

        const newBooking = { 
            id: response.result.payment.id, 
            ...bookingDetails, 
            totalCharged: Number(amountInCents),
            status: 'PAID', driver: null, bookedAt: new Date() 
        };
        saveBooking(newBooking);
        
        // --- DRIVER NOTIFICATIONS (TWILIO & EMAIL) ---
        const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved);
        approvedDrivers.forEach(async (driver) => {
            // Email Notification
            transporter.sendMail({
                from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
                to: driver.email,
                subject: `NEW JOB AVAILABLE: ${newBooking.date}`,
                html: `<p>New Job: ${pickup} to ${dropoff}</p>`
            }).catch(e => console.error("Email Error:", e.message));

            // Optional Twilio Logic could be placed here
        });

        res.json({ success: true, paymentId: response.result.payment.id });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// ==========================================
// 5. ADMIN CONTROL ROUTES
// ==========================================

app.get('/api/admin/bookings', (req, res) => res.json(getBookings()));
app.get('/api/admin/users', (req, res) => res.json(getUsers()));

app.post('/api/admin/approve-driver', (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const updatedUsers = users.map(u => {
        if (u.email === email && u.role === 'driver') return { ...u, isApproved: true };
        return u;
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
    res.json({ success: true });
});

app.delete('/api/admin/bookings/:id', (req, res) => {
    const { id } = req.params;
    const newBookings = getBookings().filter(b => b.id !== id);
    fs.writeFileSync(DB_FILE, JSON.stringify(newBookings, null, 2));
    res.json({ success: true });
});

// ==========================================
// 6. FRONTEND & START
// ==========================================
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 JOCO EXEC running on port ${PORT}`));