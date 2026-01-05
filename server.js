const { SquareClient, SquareEnvironment } = require('square'); 
const twilio = require('twilio');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';
const BASE_URL = 'http://localhost:5000'; 

app.use(cors());
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

  // BLOCK ADMIN REGISTRATION
  if (role === 'admin') {
    return res.status(403).json({ error: "Restricted role. Admin accounts cannot be created publicly." });
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email exists" });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = { 
    id: Date.now().toString(), 
    name, 
    email, 
    password: hashedPassword, 
    role: role || 'customer',
    isApproved: role === 'driver' ? false : true 
  };
  
  saveUser(newUser);
  
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ success: true, token, user: { name: newUser.name, role: newUser.role, email: newUser.email, isApproved: newUser.isApproved } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = getUsers().find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, isApproved: user.isApproved }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, role: user.role, email: user.email, isApproved: user.isApproved } });
});

// --- DISPATCH LOGIC ---
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  try {
    const response = await squareClient.payments.create({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount: BigInt(amount), currency: 'USD' }
    });

    const newBooking = { id: response.payment.id, ...bookingDetails, amount, driver: null, bookedAt: new Date() };
    saveBooking(newBooking);
    
    const approvedDrivers = getUsers().filter(u => u.role === 'driver' && u.isApproved === true);

    approvedDrivers.forEach(async (driver) => {
      const claimLink = `${BASE_URL}/api/claim-job?id=${newBooking.id}&driver=${driver.email}`;
      
      transporter.sendMail({
        from: `"JOCO" <${process.env.EMAIL_USER}>`, 
        to: driver.email,
        subject: `NEW JOB: ${newBooking.date}`,
        html: `<p>Route: ${newBooking.pickup} -> ${newBooking.dropoff}</p><a href="${claimLink}" style="padding:10px; background:gold; color:black; text-decoration:none;">ACCEPT JOB</a>`
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

// --- ADMIN ROUTES (SECURED WITH ENV PASSWORD) ---

app.get('/api/admin/users', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(getUsers());
});

app.post('/api/admin/approve-driver', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { email } = req.body;
  const users = getUsers().map(u => {
    if (u.email === email) u.isApproved = true;
    return u;
  });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.get('/api/admin/bookings', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(getBookings());
});

app.delete('/api/admin/bookings/:id', (req, res) => {
  if (req.headers['authorization'] !== process.env.ADMIN_SECRET_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const updatedBookings = getBookings().filter(b => b.id !== req.params.id);
  fs.writeFileSync(DB_FILE, JSON.stringify(updatedBookings, null, 2));
  res.json({ success: true });
});

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*path', (req, res) => { res.sendFile(path.join(__dirname, 'build', 'index.html')); });

app.listen(PORT, () => console.log(`🚀 JOCO EXEC Live on ${PORT}`));