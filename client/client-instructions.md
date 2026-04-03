# MarsGrow Frontend Instructions (React + Vite + TS)

## 🛠️ Tech Stack & Environment

- **Framework:** React 19 (Vite), TypeScript, Tailwind CSS.
- **Icons:** Lucide React.
- **Auth & Database:** Firebase (Authentication + Firestore).
- **Payments:** `react-paystack` (Official Wrapper).

## ⚠️ Critical Setup Rules

- **Installation:** To avoid React 18/19 version conflicts, ALWAYS use:
  `npm install react-paystack --save --legacy-peer-deps`
- **Paystack Fix:** Manually add the following script to the `<head>` of `index.html` to prevent "Paystack is not defined" errors:
  `<script src="https://js.paystack.co/v1/inline.js"></script>`

## 🏗️ Core Architecture

- **Auth Layer:** Wrap the app in an `AuthProvider`.
  - Use `onAuthStateChanged` to sync with a Firestore `users/{uid}` document.
  - State should include `user`, `profile` (balance, role), and `loading`.
- **Global Balance:** Use Firestore `onSnapshot` inside the AuthProvider to update the UI balance in real-time.
- **Role-Based Access (RBAC):**
  - `user`: (Default) Can see Store and Wallet.
  - `staff`: Can see the "Redemption Scanner/PIN Entry" view.
  - `admin`: Full dashboard access.

## 💳 Payment Flow (Top-Up)

1. **Initialize:** Generate a unique reference.
2. **Pre-Flight:** Create a document in `buy_requests` collection with `status: "pending"`.
3. **Trigger:** Use `usePaystackPayment(config)`.
4. **Metadata:** You MUST pass `userId: auth.currentUser.uid` inside the `metadata` object so the backend knows who to credit.
5. **Success:** Only show a "Processing" message. The backend Webhook is the only service that updates the balance.

## 📱 UI Guidelines

- **Mobile-First:** Use Tailwind `sm:`, `md:`, `lg:` prefixes.
- **Theme:** Use the MarsGrow palette (Indigo Velvet, Pumpkin Spice, Moss Green).
- **Navbar:** Sticky top, always displaying the token balance.
