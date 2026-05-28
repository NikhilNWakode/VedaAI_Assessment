# VedaAI - AI Assessment Creator

An AI-powered assessment generation platform that allows teachers to create structured question papers using Groq (Llama 3.3).

## Architecture

```
Frontend (Next.js)  <──WebSocket──>  Backend (Express)
                                          │
                                     BullMQ Queue
                                          │
                                     Worker Process
                                          │
                                    Groq API (Llama 3.3)
                                          │
                                     MongoDB Store
                                          │
                                   WebSocket Notify
```

**Data flow:**
1. Teacher fills out assignment form (subject, topic, question types, difficulty, marks, optional PDF)
2. Frontend POSTs to `/api/assignments` with multipart form data
3. Backend validates input (Zod), saves to MongoDB with `status: "queued"`, enqueues BullMQ job
4. Worker picks up job, constructs a structured prompt, calls Groq API (Llama 3.3-70b-versatile)
5. LLM returns structured JSON with sections, questions, difficulty tags, marks, and answer keys
6. Worker parses and normalizes the response, saves result to MongoDB, emits WebSocket event
7. Frontend receives real-time status update, renders the formatted exam paper

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Zustand |
| Backend | Express, TypeScript, Mongoose, BullMQ, Socket.io |
| AI | Groq SDK — Llama 3.3-70b-versatile |
| Database | MongoDB |
| Queue | Redis + BullMQ |
| Real-time | Socket.io (WebSocket) |
| PDF Export | html2canvas-pro + jsPDF (block-by-block A4 rendering) |
| Validation | Zod (server) + client-side form validation |

## Project Structure

```
Veda_assessment/
├── client/                   # Next.js frontend
│   └── src/
│       ├── app/              # Pages (dashboard, create, assessment/[id])
│       ├── components/
│       │   ├── assessment/   # PaperHeader, SectionBlock, QuestionItem, DifficultyBadge, AnswerKey
│       │   ├── dashboard/    # AssignmentList, AssignmentCard, EmptyState
│       │   ├── form/         # AssignmentForm (2-step), FileUpload, QuestionTypeSelector, DifficultySelector
│       │   ├── layout/       # AppLayout, Sidebar, TopBar, MobileNav
│       │   └── ui/           # Spinner
│       ├── hooks/            # useSocket WebSocket hook
│       ├── store/            # Zustand stores (formStore, assessmentStore)
│       ├── lib/              # API client, socket singleton, PDF export
│       └── types/            # TypeScript interfaces
└── server/                   # Express backend
    └── src/
        ├── config/           # MongoDB, Redis, Socket.io setup
        ├── models/           # Mongoose schemas (Assignment with embedded GeneratedPaper)
        ├── routes/           # Express routes
        ├── controllers/      # Request handlers
        ├── services/         # Groq AI service (prompt building + response parsing), assignment CRUD
        ├── workers/          # BullMQ generation worker
        ├── middleware/       # File upload (multer), error handling
        ├── validators/       # Zod validation schemas
        └── types/            # Shared TypeScript interfaces
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/cloud/atlas))
- Redis (local, Docker: `docker run -p 6379:6379 redis:7`, or [Upstash](https://upstash.com/))
- Groq API key ([Get free key](https://console.groq.com/keys))

### 1. Clone and install

```bash
git clone <repo-url>
cd Veda_assessment

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure environment

**Server** (`server/.env`):
```
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Client** (`client/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 3. Start services

```bash
# Terminal 1 — Start the server (Express + BullMQ worker)
cd server && npm run dev

# Terminal 2 — Start the client (Next.js)
cd client && npm run dev
```

Server runs on port 5000, client on port 3000.

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000)

## Features

### Core
- **2-Step Assignment Form** — Subject, topic, difficulty, due date (Step 1) → file upload, question types with per-type count & marks, additional instructions (Step 2)
- **AI Question Generation** — Structured prompt engineering with Groq (Llama 3.3) for reliable JSON output with sections, difficulty distribution, and answer keys
- **Real-time Updates** — WebSocket notifications for generation progress (queued → processing → completed/failed)
- **Background Job Processing** — BullMQ queue ensures non-blocking generation with Redis-backed job state
- **Input Validation** — Zod schema validation on server, client-side validation with toast feedback

### Output Page
- **Formatted Exam Paper** — School header, subject/class info, time/marks meta, general instructions
- **Student Info Section** — Name, roll number, class/section input lines
- **Structured Question Sections** — Grouped by type (Section A, B, C...) with title, instructions, and per-section marks
- **Difficulty Badges** — Color-coded tags (Easy/Moderate/Challenging) on every question
- **Marks Display** — Per-question marks shown inline
- **Answer Key** — Compact grid for MCQ/True-False + detailed cards for Short/Long answer model answers

### Bonus
- **PDF Export** — Block-by-block A4 rendering using html2canvas-pro + jsPDF. No question is ever split across page boundaries. Forces A4 width even on mobile viewports.
- **Regenerate** — One-click regeneration from the output page
- **Dashboard** — View all created assessments with status badges and timestamps
- **Mobile Responsive** — Separate mobile/desktop layouts: floating glassmorphism sidebar + topbar on desktop, progressive blur breadcrumb + bottom nav on mobile
- **PDF Upload** — Upload reference material (PDF) to generate context-aware questions

## Approach

1. **Prompt Engineering** — The AI prompt is carefully structured with exact section counts, marks distribution, difficulty percentages, and a strict JSON schema. Question types and difficulties are normalized post-response to handle LLM output variance.

2. **Async Architecture** — Generation is fully async: the API returns immediately with a job ID, BullMQ processes in the background, and Socket.IO pushes status updates. This prevents request timeouts on large papers.

3. **PDF Quality** — Instead of raw `window.print()`, the export uses `html2canvas-pro` to render each `[data-pdf-block]` element individually, then places them on A4 pages with proper margins. This ensures clean page breaks and consistent formatting across devices.

4. **Type Safety** — Shared TypeScript interfaces between client and server. Zod validates all API input. Mongoose schemas enforce structure at the database level. LLM output is parsed and normalized before storage.

## Deployment

- **Frontend**: Deploy `client/` to Vercel
- **Backend**: Deploy `server/` to Railway or Render (with Redis and MongoDB add-ons)

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to point to the deployed backend URL.
