# Earn4You Verification & Usage Guide

This document provides a comprehensive guide on how to verify the system's functionality and a breakdown of features from a user perspective. It focuses on **how to use** the system and **how to verify** it works, ignoring technical implementation details.

---

## 1. Automated Verification Setup

We have prepared automated scripts to verify the core system logic without manual clicking.

### Prerequisites
- Node.js installed.
- MongoDB running.
- Application running (`npm run dev`) at `http://localhost:3000` (or `127.0.0.1`).

### A. Full System Verification
**Script:** `scripts/system_test.js`
**Purpose:** Verifies the entire user lifecycle and admin administration.
**What it does:**
1.  **Registers an Admin** (and forces the role to 'admin').
2.  **Registers a User** using the Admin's referral code.
3.  **Updates Profile:** Changes name and wallet address.
4.  **Fetches Plans:** Confirms investment plans are loadable.
5.  **Checks Dashboard:** Verifies access to protected routes.

**How to Run:**
```bash
node scripts/system_test.js
```
**Success Indicator:** Look for green checkmarks ✅ in the console output.

### B. Referral System Verification (MLM)
**Script:** `scripts/test_referrals.js`
**Purpose:** Verifies the 3-Level Commission logic.
**Scenarios Verified:**
- **Level 1 (Direct):** 5% Commission
- **Level 2 (Indirect):** 3% Commission
- **Level 3 (Far Indirect):** 2% Commission

**How to Run:**
```bash
node scripts/test_referrals.js
```
**Success Indicator:**
- "L1 Commission User B Correct ✅"
- "L2 Commission User A Correct ✅"
- "L3 Commission Admin Correct ✅"

---

## 2. Feature Breakdown & Usage (User Guide)

### A. Authentication
*   **Registration:**
    *   **How to use:** Go to `/register`. Enter your Name, Phone Number, Password, and Referral Code (optional).
    *   **Note:** You must provide a valid phone number. If you have a referral code, you will be linked to that user's team.
*   **Login:**
    *   **How to use:** Go to `/login`. Enter your Phone Number and Password.
    *   **Security:** If you enter incorrect details, you will see a secure error toast. Successful login redirects you to the Dashboard.
*   **Logout:**
    *   **How to use:** Click "Logout" in the sidebar. This securely clears your session and cookies.

### B. Dashboard & Investment
*   **Dashboard Overview:**
    *   Shows your **Total Balance**, **Active Plan**, and **Total Earnings**.
*   **Investing (Buying a Plan):**
    *   **How to use:** Go to "Subscription Plans". Select a plan (e.g., "Silver Plan").
    *   **Payment:** You will be asked to send crypto to a specific wallet address.
    *   **Verification:** After sending, you must upload a screenshot or Transaction Hash.
    *   **Activation:** Once the Admin approves your payment, your plan becomes active immediately.

### C. Profile Management
*   **Update Details:**
    *   **How to use:** Go to "Profile". You can update your Name, Phone Number, and Wallet Address (for withdrawals).
    *   **Password:** You can legally change your password here.

### D. Referral System (My Team)
*   **Your Link:** Copy your unique Referral Link from the Dashboard.
*   **Earnings:**
    *   **Level 1:** You earn **5%** when someone you directly invite invests.
    *   **Level 2:** You earn **3%** when your invitee invites someone else.
    *   **Level 3:** You earn **2%** from the third level.
*   **Tracking:** View your "Total Commission" and list of referred users in the "My Team" or "Referrals" section.

---

## 3. Admin Feature Breakdown (Admin Guide)

### A. Admin Dashboard
*   **Access:** Log in with an account marked as 'admin'. content redirects to `/admin/dashboard`.
*   **Stats:** View Total Users, Total Deposits, and Pending Withdrawals at a glance.

### B. Payment Verification (Critical)
*   **How to use:** Go to "Verify Payments".
*   **Process:**
    1.  You will see a list of "Pending" investments.
    2.  Review the **Screenshot** or **Transaction Hash**.
    3.  Click **Approve** to activate the user's plan.
*   **Automation:** Approving a payment **automatically**:
    *   Activates the user's plan.
    *   Distributes L1, L2, L3 commissions to their referrers instantly.

### C. User Management
*   **View Users:** See a list of all registered users.
*   **Actions:** You can search users by phone number or name.

### D. Withdrawal Management
*   **Requests:** View users asking for payouts.
*   **Process:**
    1.  Check the user's "Wallet Address" and "Amount".
    2.  Pay them externally (from your crypto wallet).
    3.  Mark the request as **Approved** in the system.

---

## 4. Manual Verification Checklist

Use this checklist if you want to test the app manually in the browser.

- [ ] **Register** a new account with a phone number.
- [ ] **Login** with that account.
- [ ] **Logout** and ensure you are redirected to login.
- [ ] **Profile:** Update your Wallet Address and save. Refresh to confirm it saved.
- [ ] **Referras:** Register User B using User A's code. Confirm User A sees User B in "My Team".
- [ ] **Investment:** User B buys a plan -> "Pending".
- [ ] **Admin Approval:** Login as Admin -> Approve User B's payment.
- [ ] **Commission:** Login as User A -> Check "Commission Balance". It should have increased.
