# CV Analyzer - Quick Reference

## 🚀 Deployment Commands

### Render (Backend)
```bash
# Build Command
pip install -r requirements.txt

# Start Command
gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:10000
```

### Vercel (Frontend)
```bash
# Build Command
npm run build

# Output Directory
dist
```

---

## 🔑 Environment Variables

### Backend (Render)
```bash
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DATABASE_URL=sqlite:///./cv_analysis.db
HF_TOKEN=<your-huggingface-token>
FRONTEND_URL=<your-vercel-url>
FAST_MODE=true
```

### Frontend (Vercel)
```bash
VITE_API_URL=<your-render-backend-url>
```

---

## 📋 Pre-Deployment Checklist

- [ ] Get Hugging Face API token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- [ ] Create Render account at [render.com](https://render.com)
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Push code to GitHub
- [ ] Copy `.env.example` files and fill with actual values (locally)

---

## 🔗 Important URLs

**After Deployment:**
- Backend Health Check: `https://your-backend.onrender.com/health`
- Backend API Docs: `https://your-backend.onrender.com/docs`
- Frontend: `https://your-app.vercel.app`

---

## ⚡ Quick Test

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
# Expected: {"status":"ok"}
```

### Test Frontend Connection
1. Open browser DevTools → Network tab
2. Visit your Vercel URL
3. Try to login/register
4. Check for CORS errors

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Update `FRONTEND_URL` in Render to match Vercel URL exactly |
| Backend won't start | Check Render logs, verify environment variables are set |
| Frontend can't connect | Verify `VITE_API_URL` in Vercel environment variables |
| Database resets | Normal with SQLite on Render (upgrade to PostgreSQL) |
| Slow first request | Render free tier spins down after 15 min (upgrade to paid) |

---

## 📚 Full Documentation

- **Deployment Guide:** [RENDER_VERCEL_DEPLOYMENT.md](./RENDER_VERCEL_DEPLOYMENT.md)
- **Project Structure:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Backend .env:** [backend/.env.example](./backend/.env.example)
- **Frontend .env:** [.env.example](./.env.example)

---

## 🆘 Support

**Render:** [render.com/docs](https://render.com/docs)  
**Vercel:** [vercel.com/docs](https://vercel.com/docs)  
**Hugging Face:** [huggingface.co/docs](https://huggingface.co/docs)
