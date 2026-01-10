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

BigInt.prototype.toJSON = function() { return this.toString(); };

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'joco-executive-transportation-secret';
const DB_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Constants from your Apple Portal
const APPLE_TEAM_ID = "827CZWJ6A7";
const APPLE_KID = "RFDK578343";
const APPLE_MAPS_ID = "maps.www.jocoexec.com";
const APPLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgD5Q1Ac5/sq6bT7Wo
uPh5WkE7uBY1r5du6wiXvCFc2QWgCgYIKoZIzj0DAQehRANCAARhbyTtTbwluK6h
RtM/12tMPgpIhRx8Ug+trsmA+Bqmmx3FpYS2/3Hl0e3LBUU90J9Kp9hHP5Ibjb7/
I5zndah7
-----END PRIVATE KEY-----`;

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
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

// --- APPLE MAPS SERVER TOKEN (Optimized for ETAs API) ---
async function getAppleMapsServerToken() {
    const iat = Math.floor(Date.now() / 1000);
    return jwt.sign({
        iss: APPLE_TEAM_ID,
        sub: APPLE_MAPS_ID, // Required for Server-to-Server
        iat: iat,
        exp: iat + 900      // 15 min limit
    }, APPLE_PRIVATE_KEY, {
        algorithm: 'ES256',
        header: { alg: 'ES256', kid: APPLE_KID, typ: 'JWT' }
    });
}

// --- HIGHER-OF-THE-TWO PRICING ENGINE ---
async function calculateDynamicQuote(vehicleType, pickupCoords, dropoffCoords) {
    const config = PRICING_CONFIG[vehicleType];
    if (!config) throw new Error(`Pricing not configured for: ${vehicleType}`);

    try {
        const serverToken = await getAppleMapsServerToken();
        const url = `https://maps-api.apple.com/v1/etas?origin=${pickupCoords.latitude},${pickupCoords.longitude}&destinations=${dropoffCoords.latitude},${dropoffCoords.longitude}&transportType=Automobile`;
        
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${serverToken}` } });
        if (!response.data.etas || response.data.etas.length === 0) throw new Error("No route found");

        const distanceInMiles = response.data.etas[0].distanceMeters / 1609.34;
        const mileageTotal = distanceInMiles * config.perMileRate;
        
        // Math.max ensures we charge at least the base minimum
        const finalQuote = Math.max(config.baseRate, mileageTotal);

        return {
            quote: parseFloat(finalQuote.toFixed(2)),
            distance: distanceInMiles.toFixed(2),
            method: mileageTotal > config.baseRate ? "Mileage Rate Applied" : "Minimum Base Rate Applied"
        };
    } catch (error) { 
        return { quote: config.baseRate, distance: "0.00", error: "Using default base rate" }; 
    }
}

// API Routes (Remaining logic preserved)
app.get('/api/maps/token', (req, res) => {
    const iat = Math.floor(Date.now() / 1000);
    const token = jwt.sign({
        iss: APPLE_TEAM_ID,
        iat: iat,
        exp: iat + 1200,
        origin: "https://www.jocoexec.com"
    }, APPLE_PRIVATE_KEY, {
        algorithm: 'ES256',
        header: { alg: 'ES256', kid: APPLE_KID, typ: 'JWT' }
    });
    res.json({ token });
});

app.post('/api/get-quote', async (req, res) => {
    const { vehicleType, pickup, dropoff } = req.body;
    const result = await calculateDynamicQuote(vehicleType, pickup, dropoff);
    res.json(result);
});

// Process Payment, Auth, and Static loading omitted for brevity but remain unchanged
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 JOCO EXEC running on port ${PORT}`));