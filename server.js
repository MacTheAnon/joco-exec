const { SquareClient, SquareEnvironment } = require('square'); 
const twilio = require('twilio');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require("@googlemaps/google-maps-services-js"); // Added for Mapping
require('dotenv').config();

// 1. DYNAMIC IP CONFIGURATION
const LOCAL_IP = '192.168.1.4'; 
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`; 

console.log(`🚀 CONFIG: Server targeting ${BASE_URL}`);

// Initialize Google Maps Client
const googleMapsClient = new Client({});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const app = express();

const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

// 2. UPDATED CORS FOR MULTI-DEVICE TESTING
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN, 
  environment: SquareEnvironment.Sandbox, 
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- DATABASE HELPERS ---
const getBookings = () => {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
};
const saveBooking = (b) => fs.writeFileSync(DB_FILE, JSON.stringify([...getBookings(), b], null, 2));
const updateBooking = (updated) => {
  const bb = getBookings().map(b => b.id === updated.id ? updated : b);
  fs.writeFileSync(DB_FILE, JSON.stringify(bb, null, 2));
};
const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
};
const saveUser = (u) => fs.writeFileSync(USERS_FILE, JSON.stringify([...getUsers(), u], null, 2));

// --- CALENDAR HELPER ---
const createGoogleCalLink = (b) => {
  const start = new Date(`${b.date}T${b.time}`);
  const end = new Date(start.getTime() + 3600000);
  const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Limo: '+b.name)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(b.pickup)}&location=${encodeURIComponent(b.pickup)}`;
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (role === 'admin') return res.status(403).json({ error: "Restricted role." });

  const users = getUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email exists" });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { 
    id: Date.now().toString(), 
    name, email, password: hashedPassword, 
    role: role || 'customer',
    isApproved: role === 'driver' ? false : true 
  };
  
  saveUser(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = getUsers().find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

// --- DISPATCH & PAYMENT (WITH INTEGRATED GEOCODING) ---
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  
  try {
    // A. Geocode the address to get Coordinates for the Admin Map
    let coords = { lat: 38.91, lng: -94.68 }; // Default: Overland Park
    try {
      const geoRes = await googleMapsClient.geocode({
        params: {
          address: bookingDetails.pickup,
          key: process.env.REACT_APP_GOOGLE_MAPS_KEY 
        }
      });
      if (geoRes.data.results.length > 0) {
        coords = geoRes.data.results[0].geometry.location;
      }
    } catch (geoErr) {
      console.error("📍 Geocoding error (using fallback):", geoErr.message);
    }

    // B. Process Square Payment
    const response = await squareClient.payments.create({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount: BigInt(amount), currency: 'USD' }
    });

    // C. Save Booking with Coords
    const newBooking = { 
        id: response.payment.id, 
        ...bookingDetails, 
        coords, // Added for Mapping
        amount, 
        driver: null, 
        bookedAt: new Date() 
    };
    saveBooking(newBooking);
    
    // D. Dispatch Alerts
    const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);
    approvedDrivers.forEach(async (driver) => {
      const claimLink = `${BASE_URL}/api/claim-job?id=${newBooking.id}&driver=${driver.email}`;
      
      transporter.sendMail({
        from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
        to: driver.email,
        subject: `NEW JOB: ${newBooking.date}`,
        html: `<p>Route: ${newBooking.pickup} -> ${newBooking.dropoff}</p><a href="${claimLink}" style="padding:15px; background:#C5A059; color:black; text-decoration:none; font-weight:bold; border-radius:4px;">ACCEPT JOB</a>`
      });

      if (process.env.TWILIO_PHONE) {
        try {
          await twilioClient.messages.create({
            body: `JOCO EXEC: New Job from ${newBooking.pickup}. Claim: ${claimLink}`,
            from: process.env.TWILIO_PHONE,
            to: driver.phone || driver.email
          });
        } catch (smsErr) { console.error("SMS Error:", smsErr.message); }
      }
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- DRIVER ENDPOINTS ---
app.get('/api/user/my-bookings', (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, SECRET_KEY);
    const trips = getBookings().filter(b => b.driver === decoded.email);
    res.json(trips);
  } catch (e) { res.status(401).send(); }
});

app.get('/api/claim-job', (req, res) => {
  const { id, driver } = req.query;
  const bookings = getBookings();
  const job = bookings.find(b => b.id === id);
  if (!job || job.driver) return res.send("<h1>Sorry!</h1><p>Job unavailable or already claimed.</p>");
  job.driver = driver;
  updateBooking(job);
  res.send(`<h1>Job Claimed!</h1><p>It is now in your portal.</p><a href="${createGoogleCalLink(job)}">Add to Calendar</a>`);
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) return res.status(401).send();
  res.json(getUsers());
});

app.post('/api/admin/approve-driver', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) return res.status(401).send();
  const users = getUsers().map(u => {
    if (u.email === req.body.email) u.isApproved = true;
    return u;
  });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.get('/api/admin/bookings', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) return res.status(401).send();
  res.json(getBookings());
});

app.delete('/api/admin/bookings/:id', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) return res.status(401).send();
  const updated = getBookings().filter(b => b.id !== req.params.id);
  fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2));
  res.json({ success: true });
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*path', (req, res) => { res.sendFile(path.join(__dirname, 'build', 'index.html')); });
// --- AVAILABILITY CHECK ---
app.post('/api/check-availability', (req, res) => {
  try {
    const { date, time } = req.body;
    const bookings = getBookings();
    
    // Checks if there is already a booking at that date and time
    const isTaken = bookings.some(b => b.date === date && b.time === time);
    
    console.log(`🔍 Checking availability for ${date} @ ${time}: ${isTaken ? 'TAKEN' : 'AVAILABLE'}`);
    
    res.json({ available: !isTaken });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// BIND TO 0.0.0.0 TO ALLOW EXTERNAL CONNECTIONS (IPHONE)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 JOCO EXEC running on port ${PORT}`);
  console.log(`🔗 Local:   http://localhost:${PORT}`);
  console.log(`🔗 Network: http://${LOCAL_IP}:${PORT}`);
});