🎩 JOCO EXEC: Luxury Fleet Management System

A full-stack, mobile-optimized dispatch and booking platform for executive transportation services. This system handles everything from customer reservations and Square payments to driver dispatching via SMS/Email.
🚀 Quick Start
1. Prerequisites

    Node.js (v18 or higher recommended)

    Square Developer Account (for payments)

    Twilio Account (for SMS alerts)

    Gmail Account (for email dispatch)

2. Installation

Clone your project or navigate to the folder and run:
Bash

# Install backend dependencies
npm install express cors dotenv square twilio nodemailer bcryptjs jsonwebtoken

# Install frontend dependencies
cd client
npm install react-router-dom lucide-react recharts

3. Environment Configuration

Create a .env file in the root folder (not the client folder) and paste your credentials:
Code snippet

PORT=5000
ADMIN_SECRET_PASSWORD=JoC03x3c2026
JWT_SECRET=choose_a_long_random_string

# SQUARE
SQUARE_APP_ID=sandbox-sq...
SQUARE_ACCESS_TOKEN=EAAA...
SQUARE_ENVIRONMENT=sandbox

# GMAIL (Dispatch)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password

# TWILIO (SMS)
TWILIO_SID=AC...
TWILIO_TOKEN=your_token
TWILIO_PHONE=+1855...

# DISPATCH LIST
DRIVER_EMAILS=driver1@email.com,driver2@email.com

🛠 System Architecture
Core Workflows:

    Customer Side: Fills out BookingForm -> Checks availability -> SquarePayment (Deposit) -> Data saved to bookings.json.

    Dispatch: Payment triggers Nodemailer and Twilio. All Approved Drivers receive an "Accept Job" link.

    Driver Side: First driver to click the link "Claims" the job. It moves to their private DriverDashboard with native GPS links.

    Admin Side: Accesses Admin.js with the secret password to view revenue charts, delete bookings, or approve new driver registrations.

📱 Mobile Optimizations

The system is built with a "Mobile-First" philosophy:

    Touch Targets: All buttons are minimum 48px tall for easy tapping.

    Anti-Zoom: All inputs are set to 16px font-size to prevent iOS browser zooming.

    Responsive Tables: Data tables use overflow-x: auto to allow swiping on small screens.

    Hamburger Menu: A custom React-state-driven menu for clean navigation on phones.

🔐 Security Protocols

    JWT (JSON Web Tokens): Secured driver and customer sessions.

    BigInt Square Support: Handles high-precision currency values without rounding errors.

    Admin Shield: Admin endpoints require the ADMIN_SECRET_PASSWORD in the request headers.

    Role Protection: Chauffeurs are registered as isApproved: false. They cannot see the dispatch board until a human admin verifies their credentials.

📈 Deployment

To push the site live:

    Run npm run build in the client folder.

    Move the resulting build folder to your root directory.

    Host the Node.js server on a platform like Render, Railway, or Heroku.