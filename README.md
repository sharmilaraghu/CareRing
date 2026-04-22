# 🩺 CareRing

**A caring presence, always within reach.**

CareRing is a voice-first emotional care companion for elderly parents living alone. It uses ElevenLabs Conversational AI with a warm companion persona ("Rosie") and Google Gemini AI for intelligent health data extraction — turning natural voice conversations into actionable health insights for caretakers.

<!-- Screenshot: Landing page with role selection -->
![Landing Page](docs/screenshots/landing.png)

---

## ✨ Features

### For Elders
- 🌸 **Talk to Rosie** — Voice-first health check-ins powered by ElevenLabs Conversational AI
- 💊 **Medicine Timeline** — Visual daily schedule with one-tap taken/missed logging
- 💝 **Mood Tracker** — Quick emoji-based mood check-ins
- 📋 **Doctor Guidelines** — Prescription advice and follow-up reminders
- 🔔 **Smart Alerts** — Severity-based notifications from conversation analysis

<!-- Screenshot: Elder dashboard showing medicine timeline and mood tracker -->
![Elder Dashboard](docs/screenshots/elder-dashboard.png)

<!-- Screenshot: Voice conversation with Rosie active -->
![Talk to Rosie](docs/screenshots/talk-to-rosie.png)

### For Caretakers
- 📄 **Prescription Upload** — Upload prescription images/PDFs → Gemini Vision OCR auto-populates medicines
- 💊 **Medicine Management** — Add, edit, and remove medicines with full schedule details
- 🔔 **Real-time Alerts** — Severity-coded alerts (high/medium/low) with acknowledge workflow
- 🌡️ **Symptom History** — Track reported symptoms with severity trends
- 📊 **Patient Summary** — At-a-glance cards for medicines, mood, symptoms, and alerts

<!-- Screenshot: Caretaker dashboard with prescription card and alerts -->
![Caretaker Dashboard](docs/screenshots/caretaker-dashboard.png)

<!-- Screenshot: Prescription upload and parsed result -->
![Prescription Upload](docs/screenshots/prescription-upload.png)

---

## 🏗️ Architecture

```
Voice Check-In (ElevenLabs) → Transcript
  → Gemini 2.5 Flash Extraction → Structured Data (medications, symptoms, emotion)
  → Decision Engine (pure function) → Alerts
  → Supabase Persistence → Dashboard Refresh

Prescription Upload → Gemini Vision OCR → Medicines Auto-populated
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS v4 |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **Voice AI** | ElevenLabs Conversational AI |
| **Data Extraction** | Google Gemini 2.5 Flash |
| **Prescription OCR** | Google Gemini 2.5 Flash (Vision) |
| **Testing** | Vitest + fast-check (property-based testing) |

### Key Design Decisions

- **Decision engine is a pure function** — no DB calls, no side effects, fully testable with property-based testing
- **Gemini handles both extraction and OCR** — single AI provider for transcript parsing and prescription reading
- **Flat conversation table with JSONB** — extracted data stored alongside transcripts for simplicity
- **Mobile-first with phone frame** — 430px viewport with desktop phone mockup for demo presentation
- **No authentication** — simple role selection for hackathon demo speed

---

## 📁 Project Structure

```
app/
├── page.tsx                    # Landing — role selection
├── elder/page.tsx              # Elder dashboard (voice + medicines + mood)
├── caretaker/page.tsx          # Caretaker dashboard (prescriptions + alerts)
└── api/
    ├── signed-url/             # ElevenLabs signed URL
    ├── analyze-conversation/   # Transcript → extraction → alerts
    ├── upload-prescription/    # Prescription OCR
    ├── medicine/               # Medicine CRUD
    ├── medication-log/         # Daily taken/missed logging
    ├── mood/                   # Manual mood entry
    ├── patient-summary/        # Aggregated patient data
    └── alerts/acknowledge/     # Alert acknowledgment

components/
├── VoiceInterface.tsx          # ElevenLabs useConversation hook
├── elder/                      # Elder UI components
└── caretaker/                  # Caretaker UI components

lib/
├── types.ts                    # Domain types
├── decisionEngine.ts           # Alert evaluation (pure function)
├── gemini.ts                   # Gemini AI extraction + OCR
└── supabase/                   # Database clients
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [ElevenLabs](https://elevenlabs.io) account with a Conversational AI agent
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/sharmilaraghu/CareRing.git
   cd CareRing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Set up the database**

   Run the SQL migrations in your Supabase SQL editor:
   - `supabase/migrations/003_final_schema.sql`
   - `supabase/migrations/004_medication_logs.sql`

   Then seed demo data:
   - `supabase/seed.sql`

5. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

```bash
# Run all tests (single run)
npm run test

# Watch mode
npm run test:watch
```

Tests use **Vitest** with **fast-check** for property-based testing of the decision engine.

---

## 📱 Demo Flow

1. **Landing page** → Select "I need care" (elder) or "I give care" (caretaker)

2. **As Caretaker:**
   - Upload a prescription image/PDF → medicines auto-populate
   - View patient summary, manage medicines, monitor alerts

3. **As Elder:**
   - Tap "Talk to Rosie" → have a voice conversation about medications, symptoms, feelings
   - Log mood with emoji taps
   - Mark medicines as taken/missed on the timeline
   - View doctor guidelines and follow-up dates

4. **After a voice check-in:**
   - Gemini extracts medications, symptoms, and emotion from the transcript
   - Decision engine evaluates and generates alerts if needed
   - Caretaker dashboard updates with new data and alerts

<!-- Screenshot: Full demo flow showing elder conversation → caretaker alert -->
![Demo Flow](docs/screenshots/demo-flow.png)

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Elder and caretaker profiles |
| `assignments` | Elder ↔ caretaker relationships |
| `prescriptions` | Uploaded prescription metadata |
| `medicines` | Individual medications with schedule |
| `conversations` | Voice check-in transcripts + extracted data |
| `medication_logs` | Daily taken/missed tracking |
| `patient_summary` | Cached summary for fast dashboard reads |

---

## 🛠️ Built with Kiro

CareRing was deliberately chosen as a project to build with [Kiro](https://kiro.dev) because of its backend-heavy nature — multiple API routes, AI integrations, a decision engine with formal correctness properties, database schema design, and two distinct user-facing dashboards. This kind of complexity is exactly where Kiro's systematic approach shines.

### Why Kiro for this project

Most AI coding tools work well for straightforward UI tasks, but struggle when a project has deep backend logic, multiple integration points, and correctness requirements that need to hold across the entire system. CareRing has all of that:

- A **pure decision engine** with formal correctness properties (property-based testing with fast-check)
- **Multiple AI integrations** (ElevenLabs voice, Gemini extraction, Gemini OCR) each with their own error handling and fallback behavior
- **9 API routes** orchestrating database operations, AI calls, and business logic
- A **database schema** with 7 tables and cross-table relationships
- **Two separate dashboards** with different data needs pulling from the same backend

### How Kiro was used

Kiro guided the entire development lifecycle through its **spec-driven development** workflow:

1. **Requirements** — Kiro helped formalize 13 requirements with precise acceptance criteria, covering voice conversations, data extraction, decision rules, prescription OCR, medicine management, mood tracking, alerts, and both dashboards. Each requirement has clear WHEN/THEN acceptance criteria rather than vague descriptions.

2. **Design** — Kiro produced a detailed technical design including architecture diagrams, component interfaces with TypeScript signatures, API route specifications, database schema with an ER diagram, and data flow sequences. The design document served as the single source of truth throughout implementation.

3. **Correctness Properties** — This is where Kiro's systematic approach really paid off. Before writing any implementation code, Kiro helped define formal correctness properties for the decision engine — things like "if any medication has status missed, the alert level must be at least medium" and "if no triggers are detected, the engine must return null." These properties became executable property-based tests with fast-check, giving confidence that the core business logic is correct across all valid inputs, not just a handful of example cases.

4. **Task Breakdown** — Kiro decomposed the design into 9 task groups with clear dependencies: types first, then pure business logic (decision engine), then AI integration (Gemini), then database schema, then API routes, then UI components. Each task references specific requirements for traceability.

5. **Steering Files** — Kiro maintained three steering documents (product overview, project structure, tech stack) that kept all subsequent work aligned with the actual codebase as it evolved. When the implementation diverged from the original plan (switching from OpenAI to Gemini, simplifying the schema, adding prescription OCR), the steering files were updated to reflect reality.

### The systematic advantage

The spec-driven approach meant that even when rapid iteration changed the implementation significantly from the original plan, there was always a clear record of what was built, why, and how it maps to requirements. The decision engine — the most critical piece of backend logic — has formal correctness guarantees backed by property-based tests, not just "it works for these three examples."

For a hackathon project with this much backend complexity, Kiro's structured workflow prevented the kind of architectural drift that typically happens when you're moving fast. The requirements, design, and tasks stayed in sync with the code.

---

## 🌐 Deployment

Deployed on **Vercel** with automatic deployments on push to `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sharmilaraghu/CareRing)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <em>Built with ❤️ for elders who deserve a caring presence, always within reach.</em>
</p>
