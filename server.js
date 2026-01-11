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
require('dotenv').config();

// --- BIGINT FIX ---
BigInt.prototype.toJSON = function() { return this.toString(); };

// --- SERVER CONSTANTS ---
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

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

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
// 3. APPLE MAPS INTEGRATION (TOKEN DELIVERY ONLY)
// ==========================================

// These are your valid, pre-approved tokens.
const MAPS_TOKENS = {
    "www.jocoexec.com": "eyJraWQiOiI2VTgySkZDNlhUIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg0NjQ4LCJvcmlnaW4iOiJ3d3cuam9jb2V4ZWMuY29tIn0.-gPvMZbjh6DKKeTbEZP0QRgaEkxfA1X1jcO3ZZPenAzhhOd9t_gsBzaOxnGGTUaPQkl-2XbxoNpKOva-B8ZRCw",
    "jocoexec.com": "eyJraWQiOiJZTDIyTEM2NlYyIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg0NjQ4LCJvcmlnaW4iOiJqb2NvZXhlYy5jb20ifQ.661L0KfLEy9eNS8BucF-ZIGSaILZc3JXnhFoP1SvvniHUcZVL2YiyRIXxboashR6rtnjnxoeD5ZhG9Itu8va4w",
    "joco-exec.up.railway.app": "eyJraWQiOiI2Njc5N0hUNlQ0IiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg0NjQ4LCJvcmlnaW4iOiJqb2NvLWV4ZWMudXAucmFpbHdheS5hcHAifQ.-MpV0iYJQyMKN5NmIB1JFJj6eQcoE0B114XN1dK11jcISly8JluOfKvJ98ia1vToRhvhmhj3SPhzJ7Z_XUTb9g",
    "default": "eyJraWQiOiJTVDZIRzI5SDJBIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiI4MjdDWldKNkE3IiwiaWF0IjoxNzY4MDg2NTA3LCJvcmlnaW4iOiIqLmpvY29leGVjLmNvbSJ9.in54tp2O2ZteVBOVkY2jUExdZ4o691DKx_UsMTlRU5XVeZOg8br4XCMDYsF_NrK8le2elwOGSHTh6dnEBJl2_A"
};

app.get('/api/maps/token', (req, res) => {
    try {
        // Smart Domain Detection for Railway vs Live
        let requestDomain = req.headers.origin || req.headers.host || "";
        const cleanDomain = requestDomain.replace(/^https?:\/\//, '').split(':')[0].replace(/\/$/, '');
        
        let token = MAPS_TOKENS[cleanDomain];
        if (!token) token = MAPS_TOKENS["default"]; // Fallback for localhost/admin

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Token retrieval failed" });
    }
});

// Logic: Calculate Price based on FRONTEND PROVIDED Distance
function calculatePrice(vehicleType, distanceMiles) {
    const config = PRICING_CONFIG[vehicleType];
    if (!config) throw new Error(`Pricing not configured for: ${vehicleType}`);

    const miles = parseFloat(distanceMiles || 0);
    const mileageTotal = miles * config.perMileRate;
    
    // Returns the higher of Base Rate vs Mileage Rate
    const finalQuote = Math.max(config.baseRate, mileageTotal);

    return {
        quote: parseFloat(finalQuote.toFixed(2)),
        distance: miles.toFixed(2),
        method: mileageTotal > config.baseRate ? "Mileage Rate" : "Base Rate"
    };
}

// ==========================================
// 4. API ROUTES
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

app.post('/api/get-quote', (req, res) => {
    // FIX: Receive distance from frontend, do not call Apple
    const { vehicleType, distance } = req.body;
    try {
        const result = calculatePrice(vehicleType, distance);
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const ADMIN_PASS = process.env.ADMIN_SECRET || 'JoC03x3c2026';

    if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === ADMIN_PASS) {
        const token = jwt.sign({ id: 'master-admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
        return res.json({ token, user: { name: 'Master Admin', role: 'admin', isApproved: true } });
    }

    const user = getUsers().find(u => u.email === identifier || u.username === identifier);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

app.post('/api/auth/register', async (req, res) => {
    const { name, username, email, password, role } = req.body;
    const users = getUsers();
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ error: "User already exists." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        id: Date.now().toString(), 
        name, username, email,
        password: hashedPassword, role: role || 'customer',
        isApproved: role !== 'driver' 
    };
    
    saveUser(newUser);
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

app.post('/api/process-payment', async (req, res) => {
    const { sourceId, vehicleType, bookingDetails } = req.body;
    try {
        // FIX: Use the distance already calculated by the frontend
        const distance = bookingDetails.distance || 0;
        let pricing = calculatePrice(vehicleType, distance);
        
        let amountInCents = BigInt(Math.round(pricing.quote * 100));

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
        
        const drivers = getUsers().filter(u => u.role === 'driver' && u.isApproved);
        drivers.forEach(async (driver) => {
            transporter.sendMail({
                from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
                to: driver.email,
                subject: `NEW JOB: ${newBooking.date}`,
                html: `<p>New Job Available: ${newBooking.pickup} to ${newBooking.dropoff}</p><p>Fare: $${(Number(amountInCents)/100).toFixed(2)}</p>`
            }).catch(e => console.error("Email Error:", e.message));

            if (process.env.TWILIO_PHONE) {
                twilioClient.messages.create({
                    body: `JOCO EXEC: New job on ${newBooking.date} from ${newBooking.pickup}.`,
                    from: process.env.TWILIO_PHONE,
                    to: driver.phone || (process.env.DRIVER_EMAILS ? process.env.DRIVER_EMAILS.split(',')[0] : "")
                }).catch(e => console.error("SMS Error:", e.message));
            }
        });

        res.json({ success: true, paymentId: response.result.payment.id });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

app.get('/api/admin/bookings', (req, res) => res.json(getBookings()));
app.get('/api/admin/users', (req, res) => res.json(getUsers()));

app.post('/api/admin/approve-driver', (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const updatedUsers = users.map(u => (u.email === email && u.role === 'driver') ? { ...u, isApproved: true } : u);
    fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
    res.json({ success: true });
});

app.delete('/api/admin/bookings/:id', (req, res) => {
    const newBookings = getBookings().filter(b => b.id !== req.params.id);
    fs.writeFileSync(DB_FILE, JSON.stringify(newBookings, null, 2));
    res.json({ success: true });
});

// ==========================================
// 5. PRODUCTION STATIC SERVING
// ==========================================
const clientBuildPath = path.join(__dirname, 'client', 'build');
const rootBuildPath = path.join(__dirname, 'build');

// 1. Serve Static Assets (JS, CSS, Images)
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
} else if (fs.existsSync(rootBuildPath)) {
    app.use(express.static(rootBuildPath));
}

// 2. API 404 Handler
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// 3. React Router Catch-All
app.use((req, res) => {
    const target = fs.existsSync(clientBuildPath) ? clientBuildPath : rootBuildPath;
    res.sendFile(path.join(target, 'index.html'));
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JOCO EXEC Server Active`);
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🚀 Pricing Engine: Online`);
});