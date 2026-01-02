# CV Analyzer - Render & Vercel Deployment Guide

## 🚀 Quick Deployment Overview

This guide will help you deploy your CV Analyzer application:
- **Backend (FastAPI)** → Render
- **Frontend (React + Vite)** → Vercel

**Deployment time:** ~15 minutes

---

## 📋 Prerequisites

1. **Hugging Face Account**
   - Sign up at [huggingface.co](https://huggingface.co)
   - Get your API token: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

2. **Render Account**
   - Sign up at [render.com](https://render.com)
   - Free tier available

3. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Free tier available

4. **GitHub Repository** (recommended)
   - Push your code to GitHub for easier deployment

---

## 🔧 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with the latest changes.

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name:** `cv-analyzer-backend` (or your choice)
   - **Region:** Choose closest to your users (e.g., Frankfurt)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`

   **Build & Deploy:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:10000`

   **Plan:**
   - Select **Free** tier (or paid if needed)

### Step 3: Configure Environment Variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | (generate random string) | Use: `openssl rand -hex 32` |
| `DATABASE_URL` | `sqlite:///./cv_analysis.db` | SQLite (ephemeral on Render) |
| `HF_TOKEN` | `hf_xxxxx` | Your Hugging Face API token |
| `FRONTEND_URL` | (leave empty for now) | Will add after Vercel deployment |
| `FAST_MODE` | `true` | Set to `false` to enable HF API calls |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Once deployed, you'll get a URL like: `https://cv-analyzer-backend.onrender.com`

### Step 5: Test Backend

Visit: `https://your-backend-url.onrender.com/health`

Expected response:
```json
{"status": "ok"}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or use the Vercel web dashboard (easier).

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   **Framework Preset:** Vite
   
   **Root Directory:** `./` (project root)
   
   **Build Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` | Production |

**Important:** Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. You'll get a URL like: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

Go back to **Render** → Your backend service → **Environment** tab:

Update `FRONTEND_URL` to your Vercel URL:
```
FRONTEND_URL=https://your-app.vercel.app
```

Click **"Save Changes"** - Render will automatically redeploy.

---

## ✅ Part 3: Verify Deployment

### Test the Full Flow

1. Visit your Vercel frontend URL
2. Register a new account
3. Login
4. Upload a CV and job description
5. Verify analysis works

### Common Issues

**CORS Errors:**
- Make sure `FRONTEND_URL` is set correctly in Render
- Check browser console for exact error
- Verify Vercel URL matches exactly (with https://)

**Backend Health Check Fails:**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `gunicorn` command is correct

**Frontend Can't Connect to Backend:**
- Verify `VITE_API_URL` is set in Vercel
- Check Network tab in browser DevTools
- Ensure backend URL is correct (with https://)

**Database Issues:**
- SQLite on Render is ephemeral (resets on redeploy)
- For production, consider upgrading to PostgreSQL
- Data will be lost on each deployment

---

## 🔄 Updating Your Application

### Update Backend

1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Or manually deploy from Render dashboard

### Update Frontend

1. Push changes to GitHub
2. Vercel auto-deploys
3. Or manually deploy from Vercel dashboard

---

## 💰 Cost Considerations

**Free Tier Limits:**

**Render:**
- 750 hours/month (enough for 1 service running 24/7)
- Spins down after 15 min of inactivity
- First request after spin-down takes ~30 seconds

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- No cold starts

**Hugging Face API:**
- Free tier: Rate limited
- Check [pricing](https://huggingface.co/pricing) for details

---

## 🔐 Security Recommendations

1. **Never commit `.env` files** to Git
2. **Use strong SECRET_KEY** (generate with `openssl rand -hex 32`)
3. **Rotate HF_TOKEN** periodically
4. **Enable HTTPS only** (both Render and Vercel provide this)
5. **Monitor API usage** on Hugging Face dashboard

---

## 📊 Monitoring

**Render:**
- View logs in dashboard
- Set up alerts for downtime
- Monitor resource usage

**Vercel:**
- View deployment logs
- Analytics available on paid plans
- Monitor build times

---

## 🆘 Getting Help

**Render Issues:**
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Application Issues:**
- Check backend logs on Render
- Check browser console for frontend errors
- Verify environment variables are set correctly

---

## 🎯 Next Steps

1. **Add Custom Domain** (optional)
   - Configure in Vercel and Render dashboards
   - Update CORS settings accordingly

2. **Upgrade Database** (recommended for production)
   - Add PostgreSQL on Render
   - Update `DATABASE_URL` environment variable

3. **Enable Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage and costs

4. **Optimize Performance**
   - Enable caching
   - Optimize CV processing
   - Consider CDN for static assets

---

**Deployment complete! 🎉**

Your CV Analyzer is now live and accessible worldwide.
