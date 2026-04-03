# MarsGrow Backend Instructions (Node.js + Express + TS)

## 🛠️ Tech Stack & Environment

- **Framework:** Node.js, Express, TypeScript.
- **Database Admin:** `firebase-admin` (SDK).
- **Authentication:** Custom middleware to verify Firebase ID Tokens.

## 🔐 Security & Auth

- **Verify Middleware:** Create `verifyToken` middleware to validate `Authorization: Bearer <token>` using `admin.auth().verifyIdToken()`.
- **Admin Init:** Initialize using `FIREBASE_SERVICE_ACCOUNT` (JSON string) from environment variables.

## 💸 Token Ledger Logic (The Source of Truth)

- **Atomic Updates:** Use Firestore `db.runTransaction()` for ALL balance changes.
- **The Ledger:** Every transaction must write to `credits_ledger`.
  - Fields: `userId`, `amount`, `type` (PURCHASE/REDEMPTION), `previousBalance`, `newBalance`, `timestamp`.
- **Paystack Webhook:**
  - Endpoint: `POST /api/webhooks/paystack`.
  - Verification: Validate `x-paystack-signature` using `crypto` and `PAYSTACK_SECRET_KEY`.
  - Logic: On `charge.success`, find the `buy_request`, update the user's balance, create the ledger entry, and mark the request as `success`.

## 🛍️ Store & Collection Logic

- **Checkout:** Endpoint to deduct tokens and create an `orders` document.
- **Redemption:** - Generate a 6-digit `collectionCode` for every order.
  - Staff-only endpoint `POST /api/redeem` to validate the code and mark order as `COLLECTED`.

## 📂 Deployment

- **Port:** 5000.
- **Logging:** Log all incoming webhooks to a `webhook_logs` collection for debugging.
