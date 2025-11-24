# Full Stack Monorepo

A modern monorepo setup with Next.js 14 (App Router) frontend and Express backend, powered by SQLite.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: SQLite with better-sqlite3
- **Development**: npm workspaces, concurrently, tsx
- **Code Quality**: ESLint, Prettier, TypeScript

## Project Structure

```
.
├── apps/
│   ├── frontend/          # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   └── components/
│   │   └── package.json
│   └── backend/           # Express server
│       ├── src/
│       │   ├── db/       # Database and migrations
│       │   ├── routes/   # API routes
│       │   └── index.ts
│       └── package.json
├── packages/              # Shared packages (empty for now)
├── server/
│   └── exports/          # Export files directory
├── data/                 # SQLite database (auto-created)
└── package.json          # Root package with workspaces
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Getting Started

### 1. Clone and Install

```bash
# Install all dependencies
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if you need to customize:

- Backend port (default: 3001)
- API URL for frontend (default: http://localhost:3001)
- Gemini API key (optional)

### 3. Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:3001 (Express)

The database will be automatically created at `data/app.db` with all required tables.

## Available Scripts

### Root Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run format` - Format all files with Prettier
- `npm run type-check` - Run TypeScript type checking

### Frontend (apps/frontend)

- `npm run dev:frontend` - Start Next.js dev server
- `npm run build:frontend` - Build frontend for production
- `npm run start --workspace=frontend` - Start production frontend server

### Backend (apps/backend)

- `npm run dev:backend` - Start Express dev server with auto-reload
- `npm run build:backend` - Build backend TypeScript
- `npm run start --workspace=backend` - Start production backend server

## Database

### Auto-Migration

The SQLite database is automatically initialized when the backend starts. Migrations are tracked in the `migrations` table.

Initial tables:

- `users` - User records with email and name
- `items` - Items linked to users
- `migrations` - Migration tracking

### Database Location

- Development: `data/app.db`
- The database file is git-ignored and will be created on first run

## API Endpoints

### Health Check

- `GET /api/health` - Check backend and database status

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  - Body: `{ "email": "user@example.com", "name": "User Name" }`

## Development

### Adding New Dependencies

For workspace-specific dependencies:

```bash
# Frontend
npm install <package> --workspace=frontend

# Backend
npm install <package> --workspace=backend

# Root (shared dev dependencies)
npm install -D <package>
```

### Code Quality

The project is configured with:

- **ESLint**: Linting for TypeScript and JavaScript
- **Prettier**: Code formatting
- **TypeScript**: Type checking

Run checks before committing:

```bash
npm run lint
npm run format:check
npm run type-check
```

## Exports Directory

The backend creates a `server/exports` directory for file exports. This directory is automatically created on server startup.

## Optional: Gemini API Integration

To use the Gemini API (for AI features):

1. Get an API key from Google AI Studio
2. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Access in backend code via `process.env.GEMINI_API_KEY`

## Production Build

```bash
# Build all workspaces
npm run build

# Start frontend
npm run start --workspace=frontend

# Start backend
npm run start --workspace=backend
```

## Troubleshooting

### Database Issues

If you encounter database problems:

```bash
# Delete the database to reset
rm data/app.db

# Restart the backend - it will recreate with migrations
npm run dev:backend
```

### Port Conflicts

If ports 3000 or 3001 are in use, modify `.env.local`:

```
PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Module Not Found

If you get module errors after pulling changes:

```bash
# Clean install
rm -rf node_modules apps/*/node_modules
npm install
```

## License

MIT
