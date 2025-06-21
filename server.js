// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Function to generate JWT token for Tartan API
function generateTartanToken(user_id = 'user-' + Date.now()) {
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = {
    client_id: process.env.TARTAN_CLIENT_ID,
    user_id,
    iat: currentTime,
    exp: currentTime + 600 // 10 minutes
  };

  return jwt.sign(payload, process.env.TARTAN_CLIENT_SECRET, { algorithm: 'HS256' });
}

// Aadhaar Card Validation API
app.post('/validate-aadhaar', async (req, res) => {
  try {
    const { aadhaar_number, user_id } = req.body;
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
    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Aadhaar validation failed', details: error.message });
  }
});

// PAN Card Validation API
app.post('/validate-pan', async (req, res) => {
  try {
    const { pan_number, user_id } = req.body;
    const token = generateTartanToken(user_id);

    const response = await fetch('https://node.tartanhq.com/api/kyc/pan/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pan_number })
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({ error: 'PAN validation failed', details: error.message });
  }
});

// Bank Account Validation API
app.post('/validate-bank', async (req, res) => {
  try {
    const { account_number, ifsc_code, user_id } = req.body;
    const token = generateTartanToken(user_id);

    const response = await fetch('https://node.tartanhq.com/api/kyc/bank-account/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ account_number, ifsc_code })
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Bank account validation failed', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
