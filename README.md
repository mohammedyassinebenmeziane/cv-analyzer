# CV Analyzer - AI-Powered Resume Analysis

An intelligent CV analysis system powered by Hugging Face AI that helps recruiters quickly evaluate candidate resumes against job descriptions.

## 🚀 Quick Start

### Deployment (Recommended)

**Backend:** Deploy to [Render](https://render.com)  
**Frontend:** Deploy to [Vercel](https://vercel.com)

📖 **[Full Deployment Guide](./RENDER_VERCEL_DEPLOYMENT.md)** | 📋 **[Quick Reference](./QUICK_REFERENCE.md)**

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Hugging Face token
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

Visit: `http://localhost:5173`

## ✨ Features

- 🤖 **AI-Powered Analysis** - Uses Hugging Face models for intelligent CV evaluation
- 📊 **Match Scoring** - Calculates compatibility score between CV and job description
- 🎯 **Skill Extraction** - Automatically identifies technical and soft skills
- 📈 **Experience Classification** - Categorizes relevant vs. irrelevant experience
- 💡 **Smart Recommendations** - Provides actionable hiring insights
- 📁 **Bulk Upload** - Process multiple CVs simultaneously
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📜 **Analysis History** - Track and review past analyses

## 🛠️ Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Hugging Face Inference API (AI models)
- SQLite database (SQLAlchemy ORM)
- JWT authentication

**Frontend:**
- React 18 + Vite
- React Router
- Axios
- Tailwind CSS

**Deployment:**
- Render (backend hosting)
- Vercel (frontend hosting)

## 📚 Documentation

- **[Deployment Guide](./RENDER_VERCEL_DEPLOYMENT.md)** - Step-by-step deployment to Render & Vercel
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete folder layout and architecture
- **[Quick Reference](./QUICK_REFERENCE.md)** - Commands and troubleshooting

## 🔑 Environment Variables

### Backend
```bash
SECRET_KEY=<random-string>
HF_TOKEN=<huggingface-api-token>
FRONTEND_URL=<vercel-url>
DATABASE_URL=sqlite:///./cv_analysis.db
FAST_MODE=true
```

### Frontend
```bash
VITE_API_URL=<render-backend-url>
```

See `.env.example` files for details.

## 🎯 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/cv/upload` - Upload and analyze CV
- `GET /api/cv/history` - Get analysis history
- `GET /health` - Health check

Full API docs: `http://localhost:8000/docs` (when running locally)

## 🔒 Security

- JWT token authentication
- Bcrypt password hashing
- CORS protection
- Input validation
- Secure file upload

## 📝 License

This project is for educational/academic purposes.

## 🆘 Support

For deployment issues, see:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Hugging Face API](https://huggingface.co/docs/api-inference)

---

**Ready to deploy?** Start with the [Deployment Guide](./RENDER_VERCEL_DEPLOYMENT.md) 🚀
