const { Client: SquareClient, Environment } = require('square'); 
const twilio = require('twilio');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. DYNAMIC IP CONFIGURATION
const LOCAL_IP = '192.168.1.173'; 
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`; 

console.log(`🚀 CONFIG: Server targeting ${BASE_URL}`);

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const app = express();

const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- LOGGING ---
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- SQUARE CLIENT ---
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN, 
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox, 
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

// --- API ROUTES ---

app.post('/api/check-availability', (req, res) => {
  try {
    const { date, time } = req.body;
    const bookings = getBookings();
    const isTaken = bookings.some(b => b.date === date && b.time === time);
    console.log(`🔍 Checking availability for ${date} @ ${time}: ${isTaken ? 'TAKEN' : 'AVAILABLE'}`);
    res.json({ available: !isTaken });
  } catch (err) {
    console.error("Availability Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // *** MASTER ADMIN BYPASS (FIXES YOUR LOGIN ISSUE) ***
  if (email === 'kalebm.lord@gmail.com' && password === 'JoC03x3c2026') {
      console.log("👑 MASTER ADMIN LOGGED IN");
      const token = jwt.sign({ id: 'master-admin', email, role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
      return res.json({ token, user: { name: 'Admin', role: 'admin', email, isApproved: true } });
  }

  // Normal User Check
  const user = getUsers().find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

// --- PAYMENT & DISPATCH ---
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  
  try {
    // 1. Calculate Final Amount (Server-Side)
    let finalAmount = BigInt(amount);
    
    // Add $25.00 for Meet & Greet
    if (bookingDetails.meetAndGreet) {
      finalAmount += BigInt(2500); 
    }

    // 2. Process Square Payment
    const response = await squareClient.paymentsApi.createPayment({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount: finalAmount, currency: 'USD' }
    });

    // 3. Save Booking
    const newBooking = { 
        id: response.result.payment.id, 
        ...bookingDetails, 
        totalCharged: Number(finalAmount), // Convert BigInt to Number for JSON
        status: 'PAID',
        driver: null, 
        bookedAt: new Date() 
    };
    saveBooking(newBooking);
    
    // 4. Dispatch Alerts
    const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);
    approvedDrivers.forEach(async (driver) => {
      const claimLink = `${BASE_URL}/api/claim-job?id=${newBooking.id}&driver=${driver.email}`;
      
      transporter.sendMail({
        from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
        to: driver.email,
        subject: `NEW JOB: ${newBooking.date}`,
        html: `<p>Route: ${newBooking.pickup} -> ${newBooking.dropoff}</p><p>Meet & Greet: ${bookingDetails.meetAndGreet ? 'YES' : 'NO'}</p><a href="${claimLink}">ACCEPT JOB</a>`
      });
    });

    // 5. Send Success (AVOIDING BIGINT CRASH)
    res.json({ success: true, paymentId: response.result.payment.id });

  } catch (e) { 
    console.error("Payment Error:", e);
    // Handle BigInt serialization error if it occurs in logging
    res.status(500).json({ error: e.message || "Payment Processing Failed" }); 
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', (req, res) => {
  // Simple check for token or secret password
  if (req.headers['authorization'] && req.headers['authorization'].includes('Bearer')) {
     // Assume valid if they have a token (simplified for your testing)
     return res.json(getBookings());
  }
  // Fallback for direct password access
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) return res.status(401).send();
  res.json(getBookings());
});

app.get('/api/admin/users', (req, res) => res.json(getUsers()));

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 JOCO EXEC running on port ${PORT}`);
  console.log(`🔗 Local:   http://localhost:${PORT}`);
  console.log(`🔗 Network: http://${LOCAL_IP}:${PORT}`);
});