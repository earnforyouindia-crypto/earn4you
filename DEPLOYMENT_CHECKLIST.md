# Earn4You Deployment Checklist

This document outlines the critical changes and verifications required before deploying **Earn4You** to a production environment (e.g., Vercel, Netlify, AWS).

---

## 1. Environment Variables (`.env.production`)

Do **NOT** commit your `.env` file to version control (GitHub/GitLab). Instead, set these variables in your hosting provider's dashboard.

| Variable Name | Description | Example (Production) |
| :--- | :--- | :--- |
| `MONGODB_URI` | **CRITICAL**: Use a production MongoDB instance (e.g., MongoDB Atlas). Do not use `localhost`. | `mongodb+srv://user:pass@cluster.mongodb.net/earn4you-prod` |
| `JWT_SECRET` | **CRITICAL**: Generate a long, random string for secure token signing. | `openssl rand -base64 32` (run in terminal to generate) |
| `NEXT_PUBLIC_API_URL`| The public URL of your deployed site. | `https://your-domain.com/api` |
| `NODE_ENV` | implementation environment. | `production` (Usually set automatically by providers) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `dxy....` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abcdefg...` |

> **Action:** Go to your hosting dashboard (e.g., Vercel > Settings > Environment Variables) and add these.

---

## 2. Database Preparation

1.  **Whitelist IP:** Ensure your MongoDB Atlas (or other DB provider) Network Access allows connections from your hosting provider (allow `0.0.0.0/0` if unsure, or use specific IPs).
2.  **Create Admin:**
    *   Since your local database users won't exist in production, you must **register a new Admin account** immediately after deployment.
    *   **Pro Tip:** Use the `scripts/seed.js` script (updated with production DB URI) if you need to preload plans or an initial admin.

---

## 3. Build Verification

Before deploying, run the build command locally to ensure there are no compilation errors.

```bash
npm run build
```

If this command fails, **do not deploy**. Fix the errors first. Common errors include:
*   TypeScript type mismatches.
*   Unused variables (if strict linting is on).
*   Missing dependencies.

---

## 4. Hosting Provider Configuration

### Vercel (Recommended for Next.js)
*   **Root Directory:** `earn4you-next` (if your repo has subfolders).
*   **Build Command:** `next build` (Default).
*   **Install Command:** `npm install` (Default).
*   **Output Directory:** `.next` (Default).

### Netlify / Others
*   Ensure the `middleware.ts` is supported (Edge Functions).
*   Ensure `serverless` functions are supported for API routes.

---

## 5. Post-Deployment Checks

1.  **Visit Site:** Go to your `https://your-domain.com`.
2.  **Register Root Admin:** Create the very first account.
3.  **Database Check:** Log in to your MongoDB dashboard and confirm the user was created.
4.  **Feature Test:**
    *   Create a Plan.
    *   Register a test user (in a private window).
    *   Test the login flow.

---

## 6. Security Reminders

*   **HTTPS:** Ensure your domain enforces HTTPS.
*   **Logs:** Monitor server logs for any unhandled exceptions.
*   **Backups:** Enable automated backups for your MongoDB database.
