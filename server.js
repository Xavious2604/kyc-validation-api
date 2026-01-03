require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const exphbs = require('express-handlebars');

const app = express();
const PORT = 3000;

// View engine setup
app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory log and stats
let logs = [];
let stats = {
  totalRequests: 0,
  aadhaarRequests: 0,
  panRequests: 0,
  bankRequests: 0
};

// JWT generation
function generateTartanToken(user_id = 'user-' + Date.now()) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    client_id: process.env.TARTAN_CLIENT_ID,
    user_id,
    iat: now,
    exp: now + 600
  };
  return jwt.sign(payload, process.env.TARTAN_CLIENT_SECRET, { algorithm: 'HS256' });
}

// Dashboard
app.get('/', (req, res) => {
  res.render('index', {
    stats,
    logs: logs.slice(-10).reverse() // last 10 logs
  });
});

// Aadhaar Validation
app.post('/validate-aadhaar', async (req, res) => {
  const { aadhaar_number, user_id } = req.body;
  const token = generateTartanToken(user_id);
  stats.totalRequests++;
  stats.aadhaarRequests++;

  try {
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
      data: aadhaar_number,
      status: response.status
    });

    res.status(response.status).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PAN Validation
app.post('/validate-pan', async (req, res) => {
  const { pan_number, user_id } = req.body;
  const token = generateTartanToken(user_id);
  stats.totalRequests++;
  stats.panRequests++;

  try {
    const response = await fetch('https://node.tartanhq.com/api/kyc/pan/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pan_number })
    });

    const result = await response.json();

    logs.push({
      type: 'PAN',
      time: new Date().toLocaleString(),
      user_id,
      data: pan_number,
      status: response.status
    });

    res.status(response.status).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bank Account Validation
app.post('/validate-bank', async (req, res) => {
  const { account_number, ifsc_code, user_id } = req.body;
  const token = generateTartanToken(user_id);
  stats.totalRequests++;
  stats.bankRequests++;

  try {
    const response = await fetch('https://node.tartanhq.com/api/kyc/bank-account/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ account_number, ifsc_code })
    });

    const result = await response.json();

    logs.push({
      type: 'Bank',
      time: new Date().toLocaleString(),
      user_id,
      data: `${account_number} / ${ifsc_code}`,
      status: response.status
    });

    res.status(response.status).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Aadhaar validation
if (!/^\d{12}$/.test(aadhaar_number)) {
  return res.status(400).json({ error: "Invalid Aadhaar format" });
}

// PAN validation
if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan_number)) {
  return res.status(400).json({ error: "Invalid PAN format" });
}

// IFSC validation
if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
  return res.status(400).json({ error: "Invalid IFSC format" });
}
// Server start
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running at: http://localhost:${PORT}`);
});

