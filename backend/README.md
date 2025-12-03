<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=10&color=667EEA&center=true&vCenter=true&width=940&lines=Welcome+to+supply+chain+verification🌱" alt="Typing SVG" />
</div>

# Supply Chain Verification Backend

Blockchain-based supply chain verification system with product tracking and authentication.

## Features

- 🔐 Blockchain integration (Ethereum/Solana)
- 📦 Product lifecycle tracking
- 🚚 Real-time shipment monitoring
- ✅ QR code-based verification
- 📊 Analytics dashboard
- 🔒 JWT authentication
- ☁️ AWS S3 file storage
- 📧 Email/SMS notifications

## Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB/PostgreSQL
- **Blockchain:** Ethereum (Ethers.js) or Solana
- **Storage:** AWS S3, IPFS
- **Authentication:** JWT
- **Real-time:** Socket.IO

## Prerequisites

- Node.js >= 18.0.0
- MongoDB or PostgreSQL
- AWS Account (for S3)
- Blockchain wallet with test funds

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/supply-chain-verification-backend.git
cd supply-chain-verification-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## Project Structure

```
src/
├── config/          # Configuration files
├── models/          # Database models
├── controllers/     # Request handlers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── contracts/       # Smart contracts
└── jobs/            # Background jobs
```

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Endpoints

- `GET /health` - Health check
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /products` - Create product
- `GET /products/:id` - Get product details
- `POST /verify/:code` - Verify product

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

## Contact
saurabhvishwakarma419

