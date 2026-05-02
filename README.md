# Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control (Admin/Member).

## ✨ Features

- **Authentication**: Secure signup/login with JWT tokens
- **Project Management**: Create projects and manage team members
- **Task Management**: Create, assign, and track tasks with status and priority
- **Real-time Dashboard**: View projects, tasks, and statistics
- **Role-Based Access**: Admin and member permissions

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- 2 terminal windows

### Step 1: Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### Step 2: Start Frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Step 3: Open Application

Open your browser:
```
http://localhost:3000
```

## 📝 First Time Setup

1. **Sign Up** - Create a new account
2. **Create Project** - Click "+ New Project"
3. **Add Tasks** - Add tasks to your project
4. **Manage Team** - Invite team members

## 🗄️ Database

The app uses **SQLite** locally by default (no setup required).

To use PostgreSQL instead:
1. Set `DATABASE_URL` in `backend/.env`
2. Restart the backend

Example:
```
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
```

## 📁 Project Structure

```
.
├── backend/          # Express.js API + SQLite
│   ├── src/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API endpoints
│   │   └── index.js  # Server entry
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── pages/    # Login, Dashboard, Projects
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
├── setup.bat         # Windows setup helper
├── start-servers.bat # Windows start helper
└── README.md
```

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- Sequelize ORM
- SQLite / PostgreSQL
- JWT Authentication

**Frontend**
- React 18
- Vite
- React Router
- Axios

## 🚨 Troubleshooting

**Port 5000 already in use?**
```powershell
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```

**Port 3000 already in use?**
```powershell
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force
```

**Dependencies missing?**
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## 🎯 API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:memberId` - Remove member

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 📱 Environment Variables

**backend/.env**
```
DATABASE_URL=
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## 🎓 Next Steps

1. Explore the API with Postman
2. Customize styling in `frontend/src/styles/`
3. Add more features to backend routes
4. Deploy to production

## 📄 License

MIT License - Use freely for any purpose.
