# FoodBridge — Step-by-Step Deployment Guide

## What You Need (all free)
- GitHub account → github.com
- Vercel account → vercel.com (sign in with GitHub)
- Render account → render.com (sign in with GitHub)
- Railway account → railway.app (sign in with GitHub)

---

## STEP 1 — Push to GitHub (5 minutes)

### 1.1 Create GitHub repo
1. Go to https://github.com/new
2. Repository name: `foodbridge-vigyan26`
3. Set to **Public**
4. Do NOT add README or .gitignore (we already have them)
5. Click **Create repository**
6. Copy the repo URL shown (e.g. `https://github.com/YOUR_USERNAME/foodbridge-vigyan26.git`)

### 1.2 Push from your machine
Open Command Prompt and run:

```cmd
cd "d:\Hackathon\Food Bridge Vigyan-26"
git remote add origin https://github.com/YOUR_USERNAME/foodbridge-vigyan26.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## STEP 2 — Database on Railway (3 minutes)

1. Go to https://railway.app
2. Click **New Project** → **Deploy MySQL**
3. Wait ~30 seconds for it to start
4. Click the MySQL service → **Variables** tab
5. Copy the value of `DATABASE_URL` — it looks like:
   `mysql://root:password@containers-us-west-xxx.railway.app:xxxx/railway`
6. **Change** `mysql://` to `mysql+pymysql://` at the start
7. Save this URL — you'll need it in Step 3

---

## STEP 3 — Backend on Render (10 minutes)

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub account → Select `foodbridge-vigyan26` repo
3. Fill in:
   - **Name:** `foodbridge-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT run:app`
   - **Instance Type:** Free

4. Click **Advanced** → **Add Environment Variables** — add ALL of these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (paste from Railway Step 2) |
| `SECRET_KEY` | `foodbridge-prod-secret-2026-xK9mP` |
| `JWT_SECRET_KEY` | `foodbridge-jwt-prod-2026-yR7nQ` |
| `FLASK_ENV` | `production` |
| `FRONTEND_URL` | `https://foodbridge-vigyan26.vercel.app` |
| `MAIL_SERVER` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USE_TLS` | `True` |
| `MAIL_USERNAME` | your-gmail@gmail.com |
| `MAIL_PASSWORD` | (your Gmail App Password — see note below) |
| `MAIL_DEFAULT_SENDER` | your-gmail@gmail.com |

> **Gmail App Password:** Go to myaccount.google.com → Security → 2-Step Verification → App passwords → Generate one for "Mail"

5. Click **Create Web Service**
6. Wait for deployment (~3-5 min). When it shows **Live**, copy the URL:
   `https://foodbridge-api.onrender.com`

7. **Initialize the database** — open the Render Shell (top right of your service):
   ```bash
   python init_db.py
   ```
   You should see: `✅ Admin user created: admin@foodbridge.com / Admin@1234`

---

## STEP 4 — Frontend on Vercel (5 minutes)

1. Go to https://vercel.com → **Add New Project**
2. Import `foodbridge-vigyan26` from GitHub
3. Framework: **Vite** (auto-detected)
4. Root directory: ` ` (leave blank — project root)
5. Build command: `npx vite build`
6. Output directory: `dist`

7. Click **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://foodbridge-api.onrender.com` |
| `VITE_SOCKET_URL` | `https://foodbridge-api.onrender.com` |

8. Click **Deploy**
9. When done, your frontend is live at:
   `https://foodbridge-vigyan26.vercel.app`

---

## STEP 5 — Update Backend CORS (2 minutes)

1. Go back to Render → your `foodbridge-api` service → **Environment**
2. Update `FRONTEND_URL` to your actual Vercel URL:
   `https://foodbridge-vigyan26.vercel.app`
3. Click **Save Changes** — Render redeploys automatically

---

## STEP 6 — Test Everything (5 minutes)

Open your Vercel URL and test this flow:

```
✅ 1. Open https://foodbridge-vigyan26.vercel.app
✅ 2. Click Login → enter admin@foodbridge.com / Admin@1234 → lands on /admin
✅ 3. Register a Donor account → check email for verification link
✅ 4. Click verification link → login as donor → lands on /donor
✅ 5. Admin approves the donor (Admin panel → Approve)
✅ 6. Register a Receiver account → verify → login
✅ 7. Donor: Add Donation → submit
✅ 8. Receiver: See donation appear live in Available Donations
✅ 9. Receiver: Click Request Pickup
✅ 10. Donor: See notification → Approve pickup
✅ 11. Receiver: See QR code on Schedule page
✅ 12. Verify the QR → status becomes Completed → Certificate generated
```

---

## Your Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://foodbridge-vigyan26.vercel.app |
| Backend API | https://foodbridge-api.onrender.com |
| API Health | https://foodbridge-api.onrender.com/api/health |

---

## Troubleshooting

**Frontend shows blank page:**
- Check browser console → look for `VITE_API_URL` errors
- Make sure environment variables are set in Vercel

**Login says "Invalid credentials":**
- Run `python init_db.py` again in Render Shell
- Check DATABASE_URL is correct

**Email verification not arriving:**
- Check Gmail spam folder
- Verify App Password is correct (not your regular password)
- Email is optional — admin can manually approve users

**Render app sleeping (free tier):**
- Free tier sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to $7/month Render plan to keep it always-on

**Socket.IO not connecting:**
- Make sure `VITE_SOCKET_URL` points to Render URL
- Render free tier supports WebSockets

---

## Admin Credentials

| Email | Password |
|-------|----------|
| admin@foodbridge.com | Admin@1234 |

> Change this password immediately after first login!
