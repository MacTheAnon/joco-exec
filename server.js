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

// 1. IP CONFIGURATION
// This must match your computer's local IP to work on your iPhone.
const LOCAL_IP = '192.168.1.12'; 
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`; 

console.log(`🚀 CONFIG: Server targeting ${BASE_URL}`);

// 2. INITIALIZE CLIENTS
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const app = express();

// 3. FILE PATHS
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

// 4. MIDDLEWARE
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- LOGGING MIDDLEWARE ---
// Prints every request to the console so you can see what's happening.
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- SQUARE CLIENT SETUP ---
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN, 
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox, 
});

// --- NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 5. DATABASE HELPERS
// These functions read/write to your JSON files safely.

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
// 6. API ROUTES
// ==========================================

// --- CHECK AVAILABILITY ---
app.post('/api/check-availability', (req, res) => {
  try {
    const { date, time } = req.body;
    const bookings = getBookings();
    
    // Check if any existing booking has the same date AND time
    const isTaken = bookings.some(b => b.date === date && b.time === time);
    
    console.log(`🔍 Check: ${date} @ ${time} is ${isTaken ? 'TAKEN' : 'AVAILABLE'}`);
    res.json({ available: !isTaken });
  } catch (err) {
    console.error("Availability Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- LOGIN ROUTE (Username OR Email) ---
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // Identifier can be email OR username
  
  // *** MASTER ADMIN BYPASS ***
  // Allows you to login with 'admin' or your email, regardless of database state
  if ((identifier === 'kalebm.lord@gmail.com' || identifier === 'admin') && password === 'JoC03x3c2026') {
      console.log("👑 MASTER ADMIN LOGGED IN");
      const token = jwt.sign({ id: 'master-admin', email: 'admin', role: 'admin' }, SECRET_KEY, { expiresIn: '1d' });
      return res.json({ 
          token, 
          user: { name: 'Master Admin', role: 'admin', email: 'admin@internal', isApproved: true } 
      });
  }

  // Normal User Check
  const users = getUsers();
  const user = users.find(u => u.email === identifier || u.username === identifier);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  
  // Generate Token
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
  
  res.json({ 
      token, 
      user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } 
  });
});

// --- REGISTER ROUTE (Full Data) ---
app.post('/api/auth/register', async (req, res) => {
  const { name, username, email, password, role, companyName } = req.body;
  
  // Security: Prevent users from registering as admin via API
  if (role === 'admin') return res.status(403).json({ error: "Restricted role." });

  const users = getUsers();
  
  // Check duplicates
  if (users.find(u => u.email === email || u.username === username)) {
      return res.status(400).json({ error: "Email or Username already taken." });
  }
  
  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create User Object
  const newUser = { 
    id: Date.now().toString(), 
    name, 
    username, 
    email, 
    companyName: companyName || null, // Only for Corporate accounts
    password: hashedPassword, 
    role: role || 'customer', // 'customer', 'driver', or 'corporate'
    isApproved: role === 'driver' ? false : true // Drivers require manual approval
  };
  
  saveUser(newUser);
  
  // Auto-login after register
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });
  
  res.json({ 
      success: true, 
      token, 
      user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } 
  });
});

// --- PROCESS PAYMENT ---
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  
  try {
    // 1. Calculate Final Amount (Server-Side Logic)
    let finalAmount = BigInt(amount);
    
    // Add Meet & Greet Fee if selected
    if (bookingDetails.meetAndGreet) {
      finalAmount += BigInt(2500); // Adds $25.00
    }

    // 2. Process with Square
    const response = await squareClient.paymentsApi.createPayment({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount: finalAmount, currency: 'USD' }
    });

    // 3. Save Booking to Database
    const newBooking = { 
        id: response.result.payment.id, 
        ...bookingDetails, 
        totalCharged: Number(finalAmount), 
        status: 'PAID',
        driver: null, // Drivers claim this later
        bookedAt: new Date() 
    };
    saveBooking(newBooking);
    
    // 4. Dispatch Email to Approved Drivers
    const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);
    approvedDrivers.forEach(async (driver) => {
      // Logic: Send email to driver
      const mailOptions = {
        from: `"JOCO EXEC" <${process.env.EMAIL_USER}>`, 
        to: driver.email,
        subject: `NEW JOB AVAILABLE: ${newBooking.date}`,
        html: `
            <h3>New Trip Posted</h3>
            <p><strong>Date:</strong> ${newBooking.date} @ ${newBooking.time}</p>
            <p><strong>Route:</strong> ${newBooking.pickup} -> ${newBooking.dropoff}</p>
            <p><strong>Service:</strong> ${bookingDetails.serviceType}</p>
            <p>Login to the Driver Portal to claim this job.</p>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log('Email Error:', error);
          else console.log('Email Sent:', info.response);
      });
    });

    // 5. Success Response
    res.json({ success: true, paymentId: response.result.payment.id });

  } catch (e) { 
    console.error("Payment Error:", e);
    res.status(500).json({ error: e.message || "Payment Processing Failed" }); 
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', (req, res) => {
    // In a real app, verify JWT here. For now, rely on Admin.js password check.
    res.json(getBookings());
});

app.get('/api/admin/users', (req, res) => {
    res.json(getUsers());
});

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

// 7. SERVE FRONTEND (Production Build)
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all handler for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 8. START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 JOCO EXEC running on port ${PORT}`);
  console.log(`🔗 Local:   http://localhost:${PORT}`);
  console.log(`🔗 Network: http://${LOCAL_IP}:${PORT}`);
});