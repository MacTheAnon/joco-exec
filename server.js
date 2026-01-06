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

// 1. UPDATED IP ADDRESS
const LOCAL_IP = '192.168.1.12'; 
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
    console.log(`🔍 Check: ${date} @ ${time} is ${isTaken ? 'TAKEN' : 'AVAILABLE'}`);
    res.json({ available: !isTaken });
  } catch (err) {
    console.error("Availability Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- UPDATED LOGIN (USERNAME OR EMAIL) ---
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be email OR username
  
  // MASTER ADMIN BYPASS (Login with Email OR Username "admin")
  if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === 'JoC03x3c2026') {
      console.log("👑 MASTER ADMIN LOGGED IN");
      const token = jwt.sign({ id: 'master-admin', email: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
      return res.json({ token, user: { name: 'Master Admin', role: 'admin', email: 'admin@internal', isApproved: true } });
  }

  // Normal User Check (Check Email OR Username)
  const user = getUsers().find(u => u.email === identifier || u.username === identifier);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

// --- UPDATED REGISTER (INCLUDES USERNAME) ---
app.post('/api/auth/register', async (req, res) => {
  const { name, username, email, password, role } = req.body;
  
  if (role === 'admin') return res.status(403).json({ error: "Restricted role." });

  const users = getUsers();
  // Check if Email OR Username already exists
  if (users.find(u => u.email === email || u.username === username)) {
      return res.status(400).json({ error: "Email or Username already taken." });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { 
    id: Date.now().toString(), 
    name, 
    username, // Save username
    email, 
    password: hashedPassword, 
    role: role || 'customer',
    isApproved: role === 'driver' ? false : true 
  };
  
  saveUser(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

// --- PAYMENT & DISPATCH ---
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  try {
    let finalAmount = BigInt(amount);
    if (bookingDetails.meetAndGreet) finalAmount += BigInt(2500); 

    const response = await squareClient.paymentsApi.createPayment({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount: finalAmount, currency: 'USD' }
    });

    const newBooking = { 
        id: response.result.payment.id, 
        ...bookingDetails, 
        totalCharged: Number(finalAmount), 
        status: 'PAID',
        bookedAt: new Date() 
    };
    saveBooking(newBooking);
    
    // Dispatch (Simple)
    const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);
    approvedDrivers.forEach(async (driver) => {
      transporter.sendMail({
        from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
        to: driver.email,
        subject: `NEW JOB: ${newBooking.date}`,
        html: `<p>New Job Available. Log in to claim.</p>`
      });
    });

    res.json({ success: true, paymentId: response.result.payment.id });

  } catch (e) { 
    res.status(500).json({ error: e.message || "Payment Processing Failed" }); 
  }
});

app.get('/api/admin/bookings', (req, res) => res.json(getBookings()));
app.get('/api/admin/users', (req, res) => res.json(getUsers()));

// SERVE FRONTEND
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 JOCO EXEC running on port ${PORT}`);
  console.log(`🔗 Local:   http://localhost:${PORT}`);
  console.log(`🔗 Network: http://${LOCAL_IP}:${PORT}`);
});