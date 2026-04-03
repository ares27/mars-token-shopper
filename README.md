# MarsGrow 1.0 Token Store - Monorepo

A professional web application for buying digital tokens and redeeming them for physical in-store goods.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query, Firebase Auth (RBAC enabled).
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (Planned).
- **Payments:** Paystack Integration (ZAR).

## Project Structure

- `/client`: React frontend (Vite).
  - Features: Firestore RBAC, Wallet Balance Sync, Buy Request capture.
- `/server`: Express backend (API).

## Business Logic: The Token Flow

1. **Top-up:** User pays ZAR via Paystack -> Backend receives Webhook -> Ledger creates "PURCHASE" entry.
2. **Checkout:** User spends Tokens -> Backend checks balance -> Ledger creates "REDEMPTION" entry -> Order created (Status: PENDING).
3. **Collection:** User presents 6-digit PIN in-store -> Staff validates PIN via Admin Panel -> Order marked COLLECTED.

## Development Setup

1. **Frontend:**
   - Create a `client/.env` file with your Firebase config:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```
   - `cd client && npm install && npm run dev`
2. **Backend:** `cd server && npm install && npm run dev`
