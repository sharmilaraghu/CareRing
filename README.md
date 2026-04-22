# 🩺 CareRing

**A caring presence, always within reach.**

CareRing is a voice-first care companion for elderly parents living alone. Rosie — powered by **ElevenLabs Conversational AI** — checks in daily, asks about medications by name, follows up on symptoms, and logs everything automatically. Caretakers get real-time alerts and a full health dashboard, even from across the world.

> *"Loneliness makes elderly patients get sicker and stay sicker for longer. Doctors can't medicate their way out of this."* — [The Guardian](https://www.theguardian.com/commentisfree/2025/sep/24/why-do-children-of-elderly-patients-stay-away-loneliness-makes-them-sicker-longer)

<p align="center">
  <img src="images/landing.png" alt="CareRing Landing Page" width="300" />
</p>

---

## ✨ What it does

### For Elders
- 🌸 **Talk to Rosie** — natural voice check-ins via ElevenLabs Conversational AI
- 🧠 **Context-aware** — Rosie knows your medicines, symptoms, and mood before you say a word
- 💊 **Voice medication logging** — "I took my Amlodipine" → logged automatically via client tools
- 💝 **One-tap mood tracking** — emoji-based, no typing needed
- 🔔 **Smart alerts** — missed medicine? Rosie tells your caretaker

<p align="center">
  <img src="images/elder-dashboard.png" alt="Elder Dashboard" width="300" />
  &nbsp;&nbsp;
  <img src="images/elder-talktorosie.png" alt="Talk to Rosie" width="300" />
</p>

### For Caretakers
- 📄 **Prescription OCR** — upload a photo → Gemini Vision extracts medicines automatically
- 🔔 **Real-time alerts** — missed meds, high-severity symptoms, emotional distress
- 📊 **Patient summary** — medicines, mood, symptoms, alerts at a glance
- 🌡️ **Symptom history** — track patterns with severity indicators

<p align="center">
  <img src="images/caretaker-dashboard.png" alt="Caretaker Dashboard" width="300" />
</p>

---

## 🏗️ How it works

```
Elder Context (medicines, symptoms, mood) → Session Override
  → ElevenLabs Voice Agent (Rosie) ← Client Tools
  → Transcript → Gemini 2.5 Flash → Structured Data
  → Decision Engine (pure function) → Alerts → Caretaker Dashboard
```

### ElevenLabs Integration

Rosie isn't just a chatbot — she's equipped with **4 client tools** that give her real-time access to the elder's health data:

| Tool | What Rosie can do |
|------|-------------------|
| `getMedicationSchedule` | Check which medicines are due, taken, or missed right now |
| `getRecentSymptoms` | Ask follow-ups: "Last time you mentioned a headache — how is that today?" |
| `getEmotionalHistory` | Adapt tone based on recent mood |
| `logMedicationStatus` | Log taken/missed when the elder confirms — dashboard updates instantly |

At session start, the elder's full context is injected via **system prompt and first message overrides** — Rosie greets by name and asks about specific due medicines from the first word.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 |
| Backend | Next.js API Routes (9 endpoints) |
| Database | Supabase (PostgreSQL) |
| Voice AI | **ElevenLabs** Conversational AI + Client Tools |
| Extraction | Google Gemini 2.5 Flash |
| OCR | Google Gemini 2.5 Flash (Vision) |
| Testing | Vitest + fast-check (property-based testing) |

---

## 📱 Demo Flow

1. **Caretaker** uploads a prescription photo → Gemini OCR extracts medicines automatically
2. **Elder** taps "Talk to Rosie" → Rosie greets by name, asks about specific due medicines
3. Elder says "I took my blood pressure pill" → Rosie calls `logMedicationStatus` → dashboard updates
4. Elder mentions knee pain → Gemini extracts symptom → decision engine fires alert
5. **Caretaker** sees the alert instantly, acknowledges it

---

## 🚀 Getting Started

```bash
git clone https://github.com/sharmilaraghu/CareRing.git
cd CareRing
npm install
cp .env.local.example .env.local  # Fill in your keys
npm run dev
```

**Required env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`, `GEMINI_API_KEY`

**Database:** Run `supabase/migrations/003_final_schema.sql` and `004_medication_logs.sql` in your Supabase SQL editor.

---

## 🛠️ Built with Kiro

CareRing was built for a hackathon sponsored by [Kiro](https://kiro.dev) and [ElevenLabs](https://elevenlabs.io). The project was deliberately chosen to be backend-heavy — multiple AI integrations, a pure decision engine, 9 API routes, client tool orchestration — because that's where Kiro's systematic approach makes the biggest difference.

**How Kiro shaped the build:**

- **Spec-driven development** — 14 requirements with formal acceptance criteria, a detailed technical design with architecture diagrams and TypeScript interfaces, and 10 task groups with dependency ordering — all before writing implementation code
- **Correctness properties** — formal properties for the decision engine ("if any medication is missed, alert level must be at least medium") became executable property-based tests with fast-check
- **Steering files** — three living documents (product, structure, tech stack) kept the codebase aligned as the implementation evolved through rapid iteration
- **Hooks** — pre-commit secret scanning prevents accidental credential exposure
- **MCP servers** — Context7 for up-to-date library docs (ElevenLabs, Supabase, Next.js), Fetch for real-time web access to API schemas

The spec-driven approach meant that even when the stack changed mid-hackathon (OpenAI → Gemini, added client tools, added prescription OCR), there was always a clear record of what was built, why, and how it maps to requirements.

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  <strong>CareRing</strong> · Built with ElevenLabs + Kiro + Gemini + Supabase<br/>
  <em>Because the greatest act of love is simply being present.</em>
</p>
