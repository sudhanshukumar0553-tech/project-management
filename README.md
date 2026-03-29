# Trello Clone - SDE Intern Fullstack Assignment

## Tech Stack
- Frontend: Next.js 16, TypeScript, Tailwind CSS v4, @dnd-kit, Axios, lucide-react
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL with Prisma ORM
- Deployment: Vercel (frontend), Render (backend)

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Local Setup

### 1. Clone and Install
```bash
git clone <repo-url>

# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Database Setup
```bash
# Create a PostgreSQL database named trello_clone
# Update backend/.env with your DATABASE_URL

cd backend
npm run db:migrate
npm run db:seed
```

### 3. Environment Variables

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Backend (backend/.env):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trello_clone"
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Open http://localhost:3000

## Assumptions
- No authentication required - default user is assumed logged in
- BoardId=1 is the main working board (seeded automatically)
- Sample members (Alice, Bob, Carol, Dave) are pre-seeded for assignment feature
- Position uses fractional indexing for efficient reordering

## Deployment
- Frontend: Deploy to Vercel, set NEXT_PUBLIC_API_URL to backend URL
- Backend: Deploy to Render as a Node.js service, set DATABASE_URL from Render PostgreSQL
