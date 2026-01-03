# KYC Validation API 🔐

> ⚠️ **IMPORTANT NOTICE**: This is a **DEMONSTRATION PROJECT** for educational and portfolio purposes only. **NOT FOR PRODUCTION USE**. This system does not perform actual KYC verification and should not be used for real identity verification, compliance, or any critical applications.

A full-stack KYC (Know Your Customer) validation system built with Node.js and Express that provides real-time verification for Aadhaar, PAN, and Bank Account details. Features a beautiful animated client interface powered by Three.js and GSAP.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Demo Only](https://img.shields.io/badge/Status-Demo%20Only-orange)](https://github.com/Xavious2604/kyc-validation-api)

## ⚠️ Demo Disclaimer

**This project is a PROTOTYPE and DEMO application intended for:**
- Educational purposes and learning
- Portfolio demonstration
- Understanding KYC validation workflows
- Showcasing full-stack development skills

**This project is NOT:**
- ❌ Production-ready
- ❌ Compliant with actual KYC/AML regulations
- ❌ Performing real identity verification
- ❌ Suitable for handling sensitive personal data
- ❌ Legally compliant for financial services

**For production KYC systems, consult with legal experts and use certified KYC service providers.**

## 🌟 Features

- ✅ **Aadhaar Verification Demo** - Validate 12-digit Aadhaar number format
- ✅ **PAN Verification Demo** - Verify PAN card format
- ✅ **Bank Account Verification Demo** - Validate account number and IFSC code format
- ✅ **Real-time Validation** - Instant API responses with comprehensive error handling
- ✅ **Animated UI** - Three.js particle background with GSAP animations
- ✅ **Rate Limiting** - Protection against abuse (100 requests per 15 minutes)
- ✅ **Secure** - Input validation and sanitization on both client and server
- ✅ **Dashboard** - Live monitoring of validation requests and statistics

## 🚀 Live Demo

**Frontend Client:** [Deploy URL here]  
**API Base URL:** `https://kyc-validation-api-production.up.railway.app`

### Demo Credentials
```
Username: admin | Password: admin123
Username: user | Password: user123
Username: demo | Password: demo123
```

> **Note**: These are demo credentials for testing purposes only. In a production environment, implement proper authentication with hashed passwords and secure session management.

## 📋 Table of Contents

- [Demo Disclaimer](#demo-disclaimer)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Tartan API credentials ([Get them here](https://tartanhq.com)) - Optional for demo

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Xavious2604/kyc-validation-api.git
   cd kyc-validation-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   TARTAN_CLIENT_ID=your_client_id_here
   TARTAN_CLIENT_SECRET=your_client_secret_here
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Dashboard: `http://localhost:3000`
   - API Health Check: `http://localhost:3000/health`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 3000 |
| TARTAN_CLIENT_ID | Tartan API Client ID (Demo) | Yes | - |
| TARTAN_CLIENT_SECRET | Tartan API Client Secret (Demo) | Yes | - |
| ALLOWED_ORIGINS | CORS allowed origins (comma-separated) | No | * |

### Folder Structure

```
kyc-validation-api/
├── client/               # Frontend files
│   ├── client.html      # Main HTML file
│   ├── script.js        # JavaScript logic
│   └── styles.css       # Styling
├── views/               # Server-rendered views
│   └── index.handlebars # Dashboard template
├── public/              # Static assets
├── server.js            # Express server
├── .env                 # Environment variables (not committed)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── LICENSE             # MIT License
└── README.md           # This file
```

## 📡 API Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-03T06:45:00.000Z"
}
```

### Aadhaar Validation (Demo)

```
POST /validate-aadhaar
Content-Type: application/json
```

**Request Body:**
```json
{
  "aadhaar_number": "123456789012",
  "user_id": "user123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "name": "John Doe",
    "message": "Aadhaar verified successfully"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid Aadhaar format (must be 12 digits)"
}
```

### PAN Validation (Demo)

```
POST /validate-pan
Content-Type: application/json
```

**Request Body:**
```json
{
  "pan_number": "ABCDE1234F",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "name": "John Doe",
    "pan_status": "Active"
  }
}
```

### Bank Account Validation (Demo)

```
POST /validate-bank
Content-Type: application/json
```

**Request Body:**
```json
{
  "account_number": "12345678901234",
  "ifsc_code": "SBIN0001234",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "account_name": "John Doe",
    "bank_name": "State Bank of India"
  }
}
```

## 💡 Usage Examples

### Using cURL

```bash
# Validate Aadhaar
curl -X POST https://kyc-validation-api-production.up.railway.app/validate-aadhaar \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "123456789012", "user_id": "user123"}'

# Validate PAN
curl -X POST https://kyc-validation-api-production.up.railway.app/validate-pan \
  -H "Content-Type: application/json" \
  -d '{"pan_number": "ABCDE1234F", "user_id": "user123"}'

# Validate Bank Account
curl -X POST https://kyc-validation-api-production.up.railway.app/validate-bank \
  -H "Content-Type: application/json" \
  -d '{"account_number": "12345678901234", "ifsc_code": "SBIN0001234", "user_id": "user123"}'
```

### Using JavaScript (Fetch API)

```javascript
async function validateAadhaar(aadhaarNumber, userId) {
  const response = await fetch('https://kyc-validation-api-production.up.railway.app/validate-aadhaar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      aadhaar_number: aadhaarNumber,
      user_id: userId
    })
  });
  
  const result = await response.json();
  console.log(result);
}

// Demo usage
validateAadhaar('123456789012', 'user123');
```

### Using Python (Requests)

```python
import requests

url = "https://kyc-validation-api-production.up.railway.app/validate-aadhaar"
payload = {
    "aadhaar_number": "123456789012",
    "user_id": "user123"
}

response = requests.post(url, json=payload)
print(response.json())
```

## 🎨 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Token generation for Tartan API
- **express-rate-limit** - Rate limiting middleware
- **node-fetch** - HTTP requests
- **express-handlebars** - Template engine for dashboard
- **dotenv** - Environment variable management

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Core logic
- **Three.js** - 3D particle animations
- **GSAP** - Smooth UI animations
- **Anime.js** - Advanced animation effects

### Deployment
- **Railway** - Cloud hosting platform
- **Git** - Version control

## 📊 Validation Rules (Format Only)

| Field | Format | Example |
|-------|--------|---------|
| Aadhaar | 12 digits | 123456789012 |
| PAN | 5 letters + 4 digits + 1 letter | ABCDE1234F |
| Account Number | 9-18 digits | 12345678901234 |
| IFSC Code | 4 letters + 0 + 6 alphanumeric | SBIN0001234 |

> **Note**: This demo validates FORMAT only, not authenticity. Real KYC systems require government database integration and regulatory compliance.

## 🔒 Security Features (Demo Level)

- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS protection with configurable origins
- Sensitive data masking in logs
- Error handling without information leakage
- Environment-based configuration

⚠️ **Production Requirements**: Implement encryption, audit logging, compliance monitoring, secure key management, and regular security audits.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR
- Remember this is a demo project - keep it educational

## 🐛 Known Limitations

- ⚠️ **Demo-level validation only** - No actual identity verification
- ⚠️ Client-side authentication is for demonstration purposes only
- ⚠️ No real database integration (in-memory storage only)
- ⚠️ Not compliant with KYC/AML regulations
- ⚠️ No encryption for data at rest
- ⚠️ Dashboard statistics reset on server restart
- ⚠️ No audit trail or compliance logging

## 📝 Production Considerations

If you want to build a production KYC system, consider:

- [ ] Legal compliance (KYC/AML regulations)
- [ ] Database integration (MongoDB/PostgreSQL with encryption)
- [ ] Proper JWT-based authentication with secure sessions
- [ ] Government database integration via certified providers
- [ ] End-to-end encryption for sensitive data
- [ ] Comprehensive audit logging and compliance monitoring
- [ ] Regular security audits and penetration testing
- [ ] GDPR/data privacy compliance
- [ ] Multi-factor authentication
- [ ] Role-based access control (RBAC)
- [ ] Automated backup and disaster recovery
- [ ] API versioning and documentation
- [ ] Comprehensive unit and integration tests
- [ ] Performance monitoring and alerting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohammed Irfan Shaikh** (Xavier Antony)

- 🌐 GitHub: [@Xavious2604](https://github.com/Xavious2604)
- 💼 LinkedIn: [Mohammed Irfan Shaikh](https://www.linkedin.com/in/mohammed-irfan-shaikh-2362a62a4/)
- 📧 Email: [223171@theemcoe.org](mailto:223171@theemcoe.org)

## 🙏 Acknowledgments

- Tartan HQ for providing KYC verification APIs
- Three.js for 3D graphics library
- GSAP for animation framework
- Railway for seamless deployment
- Open source community for inspiration

## 📞 Support

If you have any questions or need assistance, please:

- Open an issue on GitHub
- Contact via email: 223171@theemcoe.org
- Check the API documentation

---

<div align="center">
  <p><strong>⚠️ Remember: This is a DEMO project for educational purposes only</strong></p>
  <p>For production KYC systems, consult certified KYC service providers and legal experts</p>
  <p>Made with ❤️ for learning and demonstration</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
