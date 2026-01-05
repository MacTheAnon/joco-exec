const { SquareClient, SquareEnvironment } = require('square'); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';

const BASE_URL = 'http://localhost:5000'; 

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. SETUP SQUARE & EMAIL ---
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN, 
  environment: SquareEnvironment.Sandbox, 
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- 2. DATABASE HELPERS ---
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

// --- 3. GOOGLE CALENDAR HELPER ---
const createGoogleCalLink = (b) => {
  const start = new Date(`${b.date}T${b.time}`);
  const end = new Date(start.getTime() + 3600000);
  const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Limo: '+b.name)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(b.pickup)}&location=${encodeURIComponent(b.pickup)}`;
};

// --- 4. AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const users = getUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  saveUser({ id: Date.now().toString(), name, email, password: hashedPassword, role: role || 'customer' });
  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = getUsers().find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '1d' });
  res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
});

// --- 5. BOOKING & DISPATCH ROUTES ---
app.post('/api/check-availability', (req, res) => {
  const isTaken = getBookings().some(b => b.date === req.body.date && b.time === req.body.time);
  res.json({ available: !isTaken });
});

app.get('/api/user/my-bookings', (req, res) => {
  try {
    const user = jwt.verify(req.headers['authorization'], SECRET_KEY);
    const myTrips = getBookings().filter(b => b.email === user.email || b.driver === user.email);
    res.json(myTrips.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)));
  } catch (e) { res.status(401).send(); }
});

app.get('/api/claim-job', (req, res) => {
  const { id, driver } = req.query;
  const bookings = getBookings();
  const job = bookings.find(b => b.id === id);
  if (!job || (job.driver && job.driver !== driver)) return res.send("<h1 style='color:red'>Job Already Claimed.</h1>");
  job.driver = driver;
  updateBooking(job);
  res.send(`<div style='text-align:center; padding:50px; font-family:sans-serif;'><h1>CLAIMED!</h1><a href="${createGoogleCalLink(job)}">Add to Calendar</a></div>`);
});

app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amount, bookingDetails } = req.body;
  try {
    const response = await squareClient.payments.create({
      sourceId, 
      idempotencyKey: Date.now().toString(),
      amountMoney: { amount, currency: 'USD' }
    });
    const newBooking = { id: response.payment.id, ...bookingDetails, amount, driver: null, bookedAt: new Date() };
    saveBooking(newBooking);
    
    // Dispatch to Drivers
    const drivers = (process.env.DRIVER_EMAILS || "").split(',');
    drivers.forEach(d => {
      const link = `${BASE_URL}/api/claim-job?id=${newBooking.id}&driver=${d.trim()}`;
      transporter.sendMail({
        from: '"JOCO" <'+process.env.EMAIL_USER+'>', to: d.trim(),
        subject: `NEW JOB: ${newBooking.date}`,
        html: `<p>${newBooking.pickup} -> ${newBooking.dropoff}</p><a href="${link}" style="padding:10px; background:gold; color:black; text-decoration:none;">ACCEPT JOB</a>`
      });
    });
    res.json({ success: true });
  } catch (e) { 
    console.error(e);
    res.status(500).json({ error: e.message }); 
  }
});

app.get('/api/admin/bookings', (req, res) => {
  if (req.headers['authorization'] !== 'my-secret-admin-password') return res.status(401).send();
  res.json(getBookings());
});

// --- 6. SERVE FRONTEND (Express 5.0 Fix) ---
app.use(express.static(path.join(__dirname, 'build')));

// Named wildcard required for Express 5.0
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 JOCO EXEC Server is live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});