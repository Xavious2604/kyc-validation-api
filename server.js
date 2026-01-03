require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Mock validation logic (Replace with your actual validation service)
function performAadhaarValidation(aadhaar_number) {
  // Replace this with actual validation logic or external API call
  return {
    success: true,
    valid: true,
    aadhaar_number: `XXXX-XXXX-${aadhaar_number.slice(-4)}`,
    message: 'Aadhaar number verified successfully',
    status: 'Active',
    verified_at: new Date().toISOString()
  };
}

function performPANValidation(pan_number) {
  // Replace this with actual validation logic or external API call
  return {
    success: true,
    valid: true,
    pan_number: `${pan_number.slice(0, 3)}XX${pan_number.slice(-2)}`,
    name: 'Sample Name',
    pan_status: 'Active',
    message: 'PAN verified successfully',
    verified_at: new Date().toISOString()
  };
}

function performBankValidation(account_number, ifsc_code) {
  // Replace this with actual validation logic or external API call
  return {
    success: true,
    valid: true,
    account_number: `XXXX${account_number.slice(-4)}`,
    ifsc_code: ifsc_code,
    account_name: 'Sample Account Holder',
    bank_name: 'Sample Bank',
    branch: 'Sample Branch',
    message: 'Bank account verified successfully',
    verified_at: new Date().toISOString()
  };
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
    // Call your custom validation logic or external API
    const result = performAadhaarValidation(aadhaar_number);

    logs.push({
      type: 'Aadhaar',
      time: new Date().toLocaleString(),
      user_id,
      data: `XXXX-XXXX-${aadhaar_number.slice(-4)}`,
      status: 200
    });

    res.status(200).json({ 
      success: true, 
      data: result 
    });

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
    // Call your custom validation logic or external API
    const result = performPANValidation(panUpper);

    logs.push({
      type: 'PAN',
      time: new Date().toLocaleString(),
      user_id,
      data: `${panUpper.slice(0, 3)}XX${panUpper.slice(-2)}`,
      status: 200
    });

    res.status(200).json({ 
      success: true, 
      data: result 
    });

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
    // Call your custom validation logic or external API
    const result = performBankValidation(account_number, ifscUpper);

    logs.push({
      type: 'Bank',
      time: new Date().toLocaleString(),
      user_id,
      data: `XXXX${account_number.slice(-4)} / ${ifscUpper}`,
      status: 200
    });

    res.status(200).json({ 
      success: true, 
      data: result 
    });

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
