# CV Analyzer - Project Structure

## 📁 Project Overview

```
CV ANALYSIS/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── database.py               # SQLAlchemy database config
│   │   ├── models.py                 # Database models
│   │   ├── schemas.py                # Pydantic schemas
│   │   ├── auth.py                   # Authentication logic
│   │   ├── cv_analyzer.py            # CV analysis engine (Hugging Face API)
│   │   └── routes/
│   │       ├── auth.py               # Auth endpoints
│   │       ├── cv.py                 # CV upload endpoints
│   │       └── analysis.py           # Analysis endpoints
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (DO NOT COMMIT)
│   ├── .env.example                  # Environment variables template
│   └── cv_analysis.db                # SQLite database (local only)
│
├── src/                              # React Frontend
│   ├── api/
│   │   └── axios.js                  # Axios configuration with API URL
│   ├── auth/
│   │   ├── AuthContext.jsx           # Authentication context
│   │   └── PrivateRoute.jsx          # Protected route component
│   ├── components/
│   │   ├── Navbar.jsx                # Navigation bar
│   │   ├── Loading.jsx               # Loading spinner
│   │   ├── ScoreCard.jsx             # CV score display
│   │   ├── SkillsList.jsx            # Skills list component
│   │   ├── RecommendationCard.jsx    # Recommendations display
│   │   └── CandidateProfile.jsx      # Candidate profile display
│   ├── pages/
│   │   ├── Login.jsx                 # Login page
│   │   ├── Register.jsx              # Registration page
│   │   ├── Dashboard.jsx             # Main dashboard
│   │   ├── UploadCV.jsx              # CV upload page
│   │   ├── BulkUpload.jsx            # Bulk upload page
│   │   ├── Results.jsx               # Analysis results page
│   │   └── History.jsx               # Analysis history page
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global styles
│
├── public/                           # Static assets
├── node_modules/                     # Node dependencies (DO NOT COMMIT)
├── dist/                             # Build output (DO NOT COMMIT)
│
├── package.json                      # Node.js dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
│
├── render.yaml                       # Render deployment config
├── vercel.json                       # Vercel deployment config
├── .env.example                      # Frontend env variables template
├── .gitignore                        # Git ignore rules
│
├── RENDER_VERCEL_DEPLOYMENT.md       # Deployment guide
├── PROJECT_STRUCTURE.md              # This file
└── README.md                         # Project README
```

---

## 🔧 Technology Stack

### Backend
- **Framework:** FastAPI 0.104.1
- **Server:** Uvicorn + Gunicorn
- **Database:** SQLite (SQLAlchemy ORM)
- **Authentication:** JWT (python-jose, passlib)
- **CV Processing:** PyPDF2, python-docx
- **AI Analysis:** Hugging Face Inference API (external)
- **Environment:** Python 3.9+

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Routing:** React Router DOM 6.20
- **HTTP Client:** Axios 1.6
- **Styling:** Tailwind CSS 3.3
- **Environment:** Node.js 18+

### Deployment
- **Backend Hosting:** Render (Web Service)
- **Frontend Hosting:** Vercel
- **Database:** SQLite (ephemeral on Render)
- **AI Processing:** Hugging Face Inference API

---

## 📝 Key Files Explained

### Backend

**`backend/app/main.py`**
- FastAPI application entry point
- CORS configuration for frontend
- Route registration
- Health check endpoint for Render

**`backend/app/cv_analyzer.py`**
- Core CV analysis logic
- Hugging Face API integration
- Skill extraction algorithms
- Experience classification
- Score calculation

**`backend/requirements.txt`**
- Cleaned dependencies (no torch, transformers, openai)
- Only essential packages for deployment
- Optimized for Render deployment

**`backend/.env.example`**
- Template for environment variables
- Documents required configuration
- Should be copied to `.env` and filled with actual values

### Frontend

**`src/api/axios.js`**
- Axios instance configuration
- Uses `VITE_API_URL` environment variable
- JWT token interceptor
- Error handling (401 redirects)

**`src/auth/AuthContext.jsx`**
- Global authentication state
- Login/logout functions
- Token management

**`src/pages/UploadCV.jsx`**
- CV and job description upload
- File validation
- Analysis request submission

**`src/pages/Results.jsx`**
- Display analysis results
- Score visualization
- Skills comparison
- Recommendations

### Deployment

**`render.yaml`**
- Render service configuration
- Build and start commands
- Environment variables
- Health check path

**`vercel.json`**
- Vercel deployment configuration
- SPA routing (rewrites all routes to index.html)
- Build output directory

---

## 🔐 Environment Variables

### Backend (`.env`)
```bash
SECRET_KEY=<random-string>           # JWT secret
DATABASE_URL=sqlite:///./cv_analysis.db
HF_TOKEN=<huggingface-token>         # Hugging Face API key
FRONTEND_URL=<vercel-url>            # For CORS
FAST_MODE=true                       # true = local processing, false = HF API
```

### Frontend (`.env`)
```bash
VITE_API_URL=<render-backend-url>    # Backend API URL
```

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

Visit: `http://localhost:5173`

---

## 📦 Dependencies Summary

### Backend (15 packages)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `gunicorn` - Production server
- `sqlalchemy` - Database ORM
- `pydantic` - Data validation
- `python-jose` - JWT handling
- `passlib` - Password hashing
- `PyPDF2` - PDF parsing
- `python-docx` - DOCX parsing
- `requests` - HTTP client (for HF API)
- `python-multipart` - File upload support
- `aiofiles` - Async file operations
- `python-dotenv` - Environment variables
- `email-validator` - Email validation
- `pydantic-settings` - Settings management

### Frontend (4 packages)
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling

---

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `hashed_password` - Bcrypt hashed password
- `created_at` - Timestamp

### CVAnalysis Table
- `id` - Primary key
- `user_id` - Foreign key to Users
- `filename` - Original CV filename
- `job_description` - Job description text
- `score` - Analysis score (0-100)
- `missing_skills` - JSON array
- `relevant_experience` - JSON array
- `recommendations` - JSON array
- `candidate_profile` - JSON object
- `created_at` - Timestamp

---

## 🔄 Data Flow

1. **User uploads CV + job description** → Frontend (`UploadCV.jsx`)
2. **POST request to backend** → `axios.js` → `/api/cv/upload`
3. **Backend processes CV** → `cv_analyzer.py`
   - Extract text (PyPDF2/python-docx)
   - Call Hugging Face API (if FAST_MODE=false)
   - Analyze skills, experience, education
   - Calculate match score
4. **Store results in database** → SQLite
5. **Return analysis to frontend** → Display in `Results.jsx`

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### CV Operations
- `POST /api/cv/upload` - Upload and analyze CV
- `POST /api/cv/bulk-upload` - Bulk upload CVs
- `GET /api/cv/history` - Get analysis history

### Analysis
- `GET /api/analysis/{id}` - Get specific analysis
- `DELETE /api/analysis/{id}` - Delete analysis

### Health
- `GET /health` - Health check (for Render)
- `GET /` - API info

---

## 📊 Hugging Face API Usage

The application uses **Hugging Face Inference API** (external API calls):

**Models Used:**
- `sentence-transformers/all-MiniLM-L6-v2` - Semantic similarity
- `dslim/bert-base-NER` - Named entity recognition
- `microsoft/unilm-base-cased` - Skill extraction

**Configuration:**
- Set `FAST_MODE=false` to enable API calls
- Set `FAST_MODE=true` for local processing (faster, no API costs)
- Requires `HF_TOKEN` environment variable

**Note:** Free tier has rate limits. Monitor usage at [huggingface.co](https://huggingface.co).

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt
- **CORS Protection** - Whitelist frontend domain
- **Input Validation** - Pydantic schemas
- **File Type Validation** - Only PDF/DOCX allowed
- **Environment Variables** - Secrets not in code

---

## 📈 Performance Considerations

**Backend:**
- Gunicorn with 2 workers (adjust based on Render plan)
- Uvicorn worker class for async support
- SQLite for simplicity (ephemeral on Render)
- Fast mode for local processing (no API delays)

**Frontend:**
- Vite for fast builds
- Code splitting (automatic)
- Tailwind CSS purging (production builds)
- Lazy loading for routes

**Limitations:**
- SQLite resets on Render redeploy (upgrade to PostgreSQL for persistence)
- Render free tier spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds

---

## 🎓 Next Steps

1. **Upgrade Database** - PostgreSQL for persistence
2. **Add Caching** - Redis for faster responses
3. **Implement Rate Limiting** - Protect API endpoints
4. **Add Error Tracking** - Sentry or similar
5. **Optimize CV Processing** - Batch processing, queues
6. **Add Tests** - Unit and integration tests
7. **CI/CD Pipeline** - Automated testing and deployment

---

**For deployment instructions, see:** [RENDER_VERCEL_DEPLOYMENT.md](./RENDER_VERCEL_DEPLOYMENT.md)
