# Lend App - P2P Lending Platform

P2P lending platform for Kyrgyzstan with full-stack backend, designed for App Store deployment.

## 🚀 Quick Start

### Development Mode (No Backend - Uses Mock Data)
```bash
npm install
npm run dev
```

### Full Stack (Frontend + Backend)
```bash
# Terminal 1: Start Backend
cd server
npm install
npm run db:init
npm start

# Terminal 2: Start Frontend
cd ..
npm install
npm run dev
```

## 📱 Running the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🐳 Docker Deployment

```bash
# Build and run everything with Docker
docker-compose up -d

# Or just the backend
cd server
docker-compose up -d
```

## 🏪 App Store Deployment

### Android (Capacitor)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Lend" com.lend.app
npx cap add android
npx cap sync android
npx cap open android  # Opens Android Studio
```

### iOS (Capacitor)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Lend" com.lend.app
npx cap add ios
npx cap sync ios
npx cap open ios  # Opens Xcode
```

### Web (Static Hosting)
```bash
npm run build
# Upload dist/ folder to any static host (Netlify, Vercel, Cloudflare Pages, S3)
```

## 🗄️ Backend API

The standalone backend uses SQLite and Express.js.

### Environment Variables

Create `.env` in `/server/`:
```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secret-key
CLIENT_URL=https://your-domain.com
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth/*` | Authentication |
| `/api/loans/*` | Loan management |
| `/api/payments/*` | Payment tracking |
| `/api/notifications/*` | Notifications |
| `/api/insurance/*` | Insurance services |
| `/api/chat/*` | AI Chat bot |
| `/api/upload/*` | File uploads |
| `/api/functions/*` | Business logic |

### Database

SQLite database stored at `server/data/lend.db`. Initialize with:
```bash
cd server
npm run db:init
```

## 📦 Project Structure

```
/workspace/project/repo/
├── server/                 # Backend (Express + SQLite)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── utils/          # DB utilities
│   │   └── scripts/        # DB initialization
│   ├── data/               # SQLite database
│   ├── uploads/             # Uploaded files
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/                    # Frontend (React + Vite)
│   ├── api/                # API clients
│   ├── components/          # UI components
│   ├── pages/              # Page components
│   └── lib/                # Utilities
├── capacitor.config.*       # Capacitor config
└── package.json
```

## ✨ Features

- ✅ User registration/login
- ✅ KYC verification
- ✅ Create/send signing loans
- ✅ Payment tracking
- ✅ Loan insurance
- ✅ AI assistant chat
- ✅ Tax reports generation
- ✅ Court document generator
- ✅ Credit scoring
- ✅ Notifications
- ✅ Data export/backup

## 🔧 Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

### Backend (.env)
```
PORT=3001
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-domain.com
```

## 📄 License

MIT

