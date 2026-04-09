# Pay-as-you-go AI Hacker Backend

Production-ready backend for the AI Hacker SaaS platform, built for the Stellar Hackathon.

## 🚀 Features

- **Authentication**: JWT-based Secure Authentication.
- **Scan API**: Supports both Website URLs (ZAP mock) and GitHub Repositories (Semgrep mock).
- **Payment System**: Integrated with **Stellar x402** (mocked) for pay-per-scan functionality.
- **Async Processing**: BullMQ + Redis for scalable background scanning.
- **AI Analysis**: OpenAI GPT-3.5/4 integration for structured security reports and fixes.
- **Mock Storage**: Simulated S3 storage for report archival.

## 🛠️ Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ (Redis)
- **AI**: OpenAI API
- **Payments**: Stellar SDK

## 📦 Setup & Installation

1. **Clone the Repo**
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Variables**
   Create a `.env` file based on the following template:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/ai_hacker"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your_secret_key"
   OPENAI_API_KEY="sk-..."
   STELLAR_SECRET_KEY="S..."
   ```
4. **Prisma Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
5. **Seed Database**
   ```bash
   npm run seed
   ```
6. **Start Dev Server**
   ```bash
   npm run dev
   ```

## 🔗 API Documentation

### Auth
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Get JWT token

### Scans
- `POST /api/scan`: Create a new scan (pending)
- `GET /api/scan`: List user's scans
- `GET /api/results/:id`: Get detailed results of a completed scan

### Payments
- `GET /api/pay/intent/:scanId`: Create a Stellar x402 payment intent
- `POST /api/pay`: Verify Stellar transaction and start scan

## 💎 Demo Guide

1. Login with `hacker@demo.com` / `Password123!`.
2. Create a scan for a GitHub repo (e.g., `google/guava`).
3. Note the `scanId`.
4. Call `GET /api/pay/intent/:scanId` to see the Stellar payment payload.
5. Call `POST /api/pay` with the `scanId`, `amount`, and any dummy `transactionHash` (e.g., `tx_123`).
6. Wait for the worker logs (simulated analysis).
7. Fetch results via `GET /api/results/:scanId`.
