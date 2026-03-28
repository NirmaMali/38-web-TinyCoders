# PlaceIQ - One-Stop Placement Management Platform

A complete **MERN stack** placement management platform connecting students, alumni, and administrators with intelligent job matching, career guidance, and comprehensive placement analytics.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + Tailwind CSS + Recharts + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Access + Refresh Tokens, httpOnly cookies) |
| AI | Google Gemini API |
| State | Zustand |

## 📁 Project Structure

```
/placeiq
├── /server                    # Express backend
│   ├── /controllers           # Auth, Student, Admin, Alumni, Message, AI, Notification
│   ├── /models                # User, StudentProfile, AlumniProfile, Job, Message, Notification
│   ├── /routes                # All API routes
│   ├── /middleware             # Auth (JWT), Error handler
│   ├── /utils                 # AI helper (Gemini)
│   ├── /seed                  # Database seed script
│   └── server.js              # Entry point
├── /client                    # React Vite frontend
│   └── /src
│       ├── /api               # Axios instance w/ interceptors
│       ├── /components        # DashboardLayout, ProtectedRoute, LoadingSkeleton, EmptyState
│       ├── /features          # Zustand stores (auth, notifications)
│       └── /pages             # Landing, Login, Register + Student/Admin/Alumni dashboards
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (optional, for AI features)

### 1. Clone & Install

```bash
# Server
cd placeiq/server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<your-mongodb-uri>
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<your-gemini-api-key>
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit **http://localhost:5173**

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@placeiq.com | Admin@123 |
| Student | 1rv21cs001@placeiq.com | Student@123 |
| Alumni | rajesh.alumni@placeiq.com | Alumni@123 |

## 📊 Seed Data

- **1 Admin**: Dr. Placement Admin
- **15 Students**: Across CSE, ECE, ISE, MECH (8 placed, 7 unplaced)
- **8 Alumni**: From Google, Infosys, TCS, Wipro, Amazon, Flipkart, Accenture, Deloitte
- **6 Jobs**: 3 on-campus, 2 off-campus, 1 internship

## 📱 Features

### Student Dashboard
- Profile management with skills, projects, internships, certifications
- AI-powered job matching with match scores
- Resume builder with 3 templates + AI tips
- Alumni browsing with mentorship badges
- In-app messaging
- Application tracking

### Admin Dashboard
- KPI cards (students, placement rate, avg package)
- Recharts analytics (department-wise, company-wise, year-over-year)
- Student management with search/filter/sort + CSV export
- Job posting with applicant status management
- Alumni approval workflow

### Alumni Dashboard
- Mentorship toggle
- Career path timeline
- Student messaging

## 🔧 API Routes

- `POST /api/auth/register|login|logout|refresh-token` + `GET /api/auth/me`
- `GET|PUT /api/student/profile` + `GET /api/student/jobs|applications|alumni|dashboard`
- `GET /api/admin/dashboard|students|jobs|alumni|analytics` + CRUD operations
- `GET|PUT /api/alumni/profile` + `GET /api/alumni/students`
- `POST /api/messages/send` + `GET /api/messages/inbox|:userId`
- `POST /api/ai/match-jobs|resume-tips|career-suggest`
