# LLM Benchmark Creator

A modern web application for creating and running benchmarks for Large Language Models (LLMs) to compare their performance.

## Tech Stack

- **Framework**: Next.js 16.1+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Code Quality**: ESLint + Prettier
- **Schema Validation**: Zod

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions and shared code
│   ├── api/              # API utilities (errors, responses, handlers)
│   ├── validations/      # Zod schemas for validation
│   ├── constants.ts      # Application constants
│   ├── env.ts            # Environment variable validation
│   └── prisma.ts         # Prisma client instance
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript type definitions

```

## Database Schema

The application includes the following models:

- **User**: User accounts
- **Project**: Benchmark projects
- **BenchmarkRun**: Individual benchmark runs
- **BenchmarkResult**: Results from benchmark runs
- **SavedModel**: User's saved LLM models

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment example file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and other configuration

5. Generate Prisma client:

```bash
npm run db:generate
```

6. Run database migrations:

```bash
npm run db:migrate
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Routes

- `GET /api/health` - Health check endpoint

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `NODE_ENV` - Environment (development/production)

## License

This project is private and proprietary.
