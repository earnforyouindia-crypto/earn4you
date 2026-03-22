# Earn4You Project Analysis

## Overview
**Earn4You** is a Next.js 16/React application (built with the App Router) designed as an investment and referral platform. The backend runs naturally on Next.js API Routes integrated with **MongoDB (via Mongoose)** for database storage. It enables users to purchase subscription plans, earn a daily Return on Investment (ROI), refer other users for bonuses, and withdraw accumulated returns. 

### Core Technologies
- **Frontend/Backend:** Next.js (React 19, App Router)
- **Database:** MongoDB (using `mongoose`)
- **Authentication:** Custom JWT-based (`jsonwebtoken`, verified through cookies/headers), password hashing with `bcryptjs`.
- **Styling UI:** Tailwind CSS, Framer Motion (for animations), and generic icons/toasts plugins like `lucide-react` and `react-hot-toast`.

## Architecture & Features

### 1. Database Schema (Models)
The application defines schemas located under `/models/`:
- **User:** Stores credentials (ID, email, passwords), balances (e.g., `commissionBalance`, `roiBalance`, `totalEarnings`), their active `plan`, and tracks limits like `earnedFromPlan` to cap maximum yields (typically 3x plan's value).
- **Plan:** Defines subscription tiers with properties like `price`, `dailyProfit`, `monthlyProfit`, and `referralCommission`.
- **Withdrawal:** Models the user's cash-out requests storing statuses (`pending`, `completed`, `failed`), net/gross amounts, rejection reasons, validation admins tracking, and standard identifiers.
- **Transaction:** A central ledger object detailing `deposit`, `withdrawal`, `plan_purchase`, `daily_return`, and referral level bonuses.
- **Payment:** Records the user depositing funds. Tracks payment status handled by admins (from verification arrays).

### 2. User Dashboard Roles
The layout is split natively into:

**(A) Standard Users (`/app/(dashboard)`):**
- **Dashboard:** Provides visibility to active plan returns, total withdrawals, deposits.
- **Plans & Payments:** Allows checking available VIP tiers and purchasing a plan (creates `Payment` & `Transaction` records).
- **Referrals:** Network mapping to invite friends using custom Referral codes. The referral levels cap returns out based on business logic. 
- **Cashout:** Area to view withdrawal terms and request amounts from valid account balances.

**(B) Administrators (`/app/(admin)`):**
- **Overview Dashboard:** Provides tracking for site deposits, processed withdrawals, pending verifications, and user investments. 
- **Payments:** Endpoints exist (like `POST /api/admin/payments/reject/[id]`) for admins to manually verify and reject/approve deposits. 
- **User Logic:** Ability to inspect active users or directly modify their balances acting as a manual deposit method (e.g. using specific local admin rights shown in `/api/users/[userId]/add-funds`).

### 3. Key Backend Systems
Under `app/api/...`:
- **Cron Jobs (`/api/cron/distribute-roi`):** Designed to be hit daily (internally or via an actual external cron like Vercel CRONs with a `CRON_SECRET`). This iterates over all valid active users and credits them with `roiBalance` multiplied by `plan.dailyProfit`, capping when `currentEarnings` reaches 3x the plan price.
- **Transactions Ledgers:** Core APIs maintain a double-entry style logic. Purchases or returning values generate a static `Transaction.js` doc serving as a historical receipt trail.

## Summary 
The platform is an established monolithic SaaS designed for multi-tier investments requiring admin oversight. Code is structured securely relying on `.env` (MongoDB UI + JWT). If deployed to Vercel, it scales correctly with Edge functions except that the ROI logic processes loop across all users synchronously, which in larger sets could hit serverless timeouts requiring splitting later.
