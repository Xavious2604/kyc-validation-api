require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const exphbs = require('express-handlebars');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', './views');

// CORS configuration - Update with your frontend domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/validate-', limiter);

// In-memory log and stats
let logs = [];
let stats = {
  totalRequests: 0,
  aadhaarRequests: 0,
  panRequests: 0,
  bankRequests: 0
};

// Validation middleware
const validateAadhaar = (aadhaar_number) => /^\d{12}$/.test(aadhaar_number);
const validatePAN = (pan_number) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan_number);
const validateIFSC = (ifsc_code) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code);
const validateAccountNumber = (account_number) => /^\d{9,18}$/.test(account_number);

// JWT generation
function generateTartanToken(user_id = 'user-' + Date.now()) {
  if (!process.env.TARTAN_CLIENT_ID || !process.env.TARTAN_CLIENT_SECRET) {
    throw new Error('Tartan API credentials not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    client_id: process.env.TARTAN_CLIENT_ID,
    user_id,
    iat: now,
    exp: now + 600
  };
  return jwt.sign(payload, process.env.TARTAN_CLIENT_SECRET, { algorithm: 'HS256' });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard
app.get('/', (req, res) => {
  res.render('index', {
    stats,
    logs: logs.slice(-10).reverse()
  });
});

// Aadhaar Validation
app.post('/validate-aadhaar', async (req, res) => {
  const { aadhaar_number, user_id } = req.body;

  // Validation
  if (!aadhaar_number || !user_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'aadhaar_number and user_id are required' 
    });
  }

  if (!validateAadhaar(aadhaar_number)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid Aadhaar format (must be 12 digits)' 
    });
  }

  stats.totalRequests++;
  stats.aadhaarRequests++;

  try {
    const token = generateTartanToken(user_id);

    const response = await fetch('https://node.tartanhq.com/api/kyc/aadhaar/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aadhaar_number })
    });

    const result = await response.json();

    logs.push({
      type: 'Aadhaar',
      time: new Date().toLocaleString(),
      user_id,
      data: `XXXX-XXXX-${aadhaar_number.slice(-4)}`, // Mask sensitive data
      status: response.status
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: result.message || 'Validation failed',
        details: result 
      });
    }

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('Aadhaar validation error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during validation' 
    });
  }
});

// PAN Validation
app.post('/validate-pan', async (req, res) => {
  const { pan_number, user_id } = req.body;

  // Validation
  if (!pan_number || !user_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'pan_number and user_id are required' 
    });
  }

  const panUpper = pan_number.toUpperCase();

  if (!validatePAN(panUpper)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid PAN format (e.g., ABCDE1234F)' 
    });
  }

  stats.totalRequests++;
  stats.panRequests++;

  try {
    const token = generateTartanToken(user_id);

    const response = await fetch('https://node.tartanhq.com/api/kyc/pan/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pan_number: panUpper })
    });

    const result = await response.json();

    logs.push({
      type: 'PAN',
      time: new Date().toLocaleString(),
      user_id,
      data: `${panUpper.slice(0, 3)}XX${panUpper.slice(-2)}`, // Mask sensitive data
      status: response.status
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: result.message || 'Validation failed',
        details: result 
      });
    }

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('PAN validation error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during validation' 
    });
  }
});

// Bank Account Validation
app.post('/validate-bank', async (req, res) => {
  const { account_number, ifsc_code, user_id } = req.body;

  // Validation
  if (!account_number || !ifsc_code || !user_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'account_number, ifsc_code, and user_id are required' 
    });
  }

  const ifscUpper = ifsc_code.toUpperCase();

  if (!validateAccountNumber(account_number)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid account number (9–18 digits)' 
    });
  }

  if (!validateIFSC(ifscUpper)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid IFSC format (e.g., SBIN0001234)' 
    });
  }

  stats.totalRequests++;
  stats.bankRequests++;

  try {
    const token = generateTartanToken(user_id);

    const response = await fetch('https://node.tartanhq.com/api/kyc/bank-account/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ account_number, ifsc_code: ifscUpper })
    });

    const result = await response.json();

    logs.push({
      type: 'Bank',
      time: new Date().toLocaleString(),
      user_id,
      data: `XXXX${account_number.slice(-4)} / ${ifscUpper}`, // Mask sensitive data
      status: response.status
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: result.message || 'Validation failed',
        details: result 
      });
    }

    res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error('Bank validation error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during validation' 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 KYC Validation API running at: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
