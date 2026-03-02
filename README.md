# 🧠 Second Brain — AI-Powered Knowledge System

> Built for the Altibbe/Hedamo Full-Stack Engineering Internship Assessment

A full-stack AI knowledge management system that captures, organizes, and intelligently surfaces your knowledge. Built with Next.js, PostgreSQL, and Google Gemini AI (free).

**[Live Demo →](https://second-brain-ai-powered-knowledge-s.vercel.app/)** | **[Docs →](https://second-brain-ai-powered-knowledge-s.vercel.app/docs)** | ** [register →](https://second-brain-ai-powered-knowledge-s.vercel.app/register)** 

---

## ✨ Features

| Feature | Description |
|---|---|
| **Knowledge Capture** | Rich form for notes, links, and insights with metadata |
| **AI Summarization** | Auto-generates concise summaries for every entry |
| **AI Auto-Tagging** | Intelligently categorizes content with relevant tags |
| **Conversational Query** | Ask questions — get answers from your own notes |
| **Smart Dashboard** | Search, filter by type/tag, sort all knowledge items |
| **Public API** | `GET /api/public/brain/query?q=question` — CORS-enabled |
| **Authentication** | Register/login with JWT sessions + bcrypt password hashing |
| **Command Palette** | Press `⌘K` / `Ctrl+K` to navigate anywhere instantly |
| **Knowledge Graph** | Interactive visualization of note relationships via shared tags |
| **Vector Search** | Semantic search via OpenAI embeddings + pgvector cosine similarity |
| **File Upload** | Upload PDF/DOCX/TXT/MD — text extracted, AI-summarized automatically |
| **Accessibility** | ARIA labels, roles, skip navigation, keyboard navigation, live regions |
| **Skeleton Loaders** | Smooth loading states throughout |
| **Async AI Pipeline** | AI runs in background; saves are always instant |

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **AI:** Google Gemini 1.5 Flash + text-embedding-004 (free, server-side only)
- **Deployment:** Vercel (frontend) + Neon (serverless Postgres)
- **Fonts:** Playfair Display + DM Sans

---

## 🚀 Quick Setup (Step by Step)

### 1. Clone the repo

```bash
git clone https://github.com/girishavallabhaneni/Second-Brain-AI-Powered-Knowledge-System.git
cd Second-Brain-AI-Powered-Knowledge-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
DATABASE_URL="your-postgresql-connection-string"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-random-secret-string"
```

**Getting DATABASE_URL:**
1. Go to [neon.tech](https://neon.tech) → Create a free account
2. Create a new project
3. Copy the connection string (it starts with `postgresql://`)

**Getting GEMINI_API_KEY (FREE):**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"** → **"Create API key"**
3. Copy the key — it starts with `AIza...`
4. No billing or credit card needed! ✅

### 4. Set up the database

```bash
npm run db:push
```

This creates all tables in your PostgreSQL database automatically.

### 5. Run locally

```bash
npm run dev
```

---

## 🌐 Deploying to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
4. Deploy!

---

## 📡 Public API

Query your knowledge base from anywhere:

```
GET /api/public/brain/query?q=your+question
```

**Example:**
```bash
curl "https://your-app.vercel.app/api/public/brain/query?q=what+do+I+know+about+productivity"
```

**Response:**
```json
{
  "question": "what do I know about productivity",
  "answer": "Based on your notes...",
  "sources": ["Note Title 1", "Note Title 2"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📁 Project Structure

```
second-brain/
├── app/
│   ├── page.tsx                   # Landing page (parallax hero)
│   ├── dashboard/page.tsx         # Main knowledge hub
│   ├── capture/page.tsx           # New entry form
│   ├── upload/page.tsx            # File upload (PDF/DOCX/TXT)
│   ├── graph/page.tsx             # Knowledge graph visualization
│   ├── login/page.tsx             # Auth — login
│   ├── register/page.tsx          # Auth — register
│   ├── docs/page.tsx              # Architecture docs
│   └── api/
│       ├── items/route.ts         # CRUD knowledge items
│       ├── search/route.ts        # Vector semantic search
│       ├── upload/route.ts        # File upload + text extraction
│       ├── ai/query/route.ts      # Conversational AI
│       ├── auth/                  # login / register / logout / me
│       └── public/brain/          # Public API endpoint
├── components/
│   ├── CommandPalette.tsx         # ⌘K command palette
│   └── SemanticSearch.tsx         # Vector search modal
├── lib/
│   ├── prisma.ts                  # Database client
│   ├── ai.ts                  # AI: summarize, tag, embed, query
│   └── auth.ts                    # JWT session helpers
└── prisma/
    └── schema.prisma              # DB schema with pgvector
```

---

## 🏛️ Architecture Decisions

See [/docs](https://second-brain-ai-powered-knowledge-s.vercel.app/docs) for full architecture documentation, including:
- Portable architecture with swappable components
- 5 UX principles guiding AI interaction design
- Agent automation pipeline
- Public API / infrastructure mindset

---

## 📄 License

MIT — built for assessment purposes.
