# CareRing — Tech Stack & Build

## Runtime
- **Python 3.12** (`.python-version`) — project scaffolding only
- **Node.js / Next.js 15** — primary application runtime

## Application Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS v4
- **Backend:** Next.js API Routes (`/app/api/`)
- **Database:** Supabase (PostgreSQL, service role key, no RLS)
- **Voice AI:** ElevenLabs Conversational AI (`@elevenlabs/react`, `useConversation` hook)
- **Data Extraction:** Google Gemini 2.5 Flash (`@google/generative-ai`) — transcript extraction + prescription OCR
- **Testing:** Vitest + fast-check (property-based testing) + React Testing Library

## Key Libraries
| Package | Purpose |
|---------|---------|
| `@elevenlabs/react` | Browser-side voice conversation hook + ConversationProvider |
| `@google/generative-ai` | Gemini AI for transcript extraction and prescription OCR |
| `@supabase/supabase-js` | Server-side database client (service role) |
| `@supabase/ssr` | Browser-side Supabase client |
| `fast-check` | Property-based testing |
| `vitest` | Test runner |
| `uuid` | UUID generation |

## ElevenLabs Integration
- Reference docs: `docs/elevenlabs-docs/`
- Conversational AI agent configured externally (agent ID via env var)
- Signed URL flow: client → `/api/signed-url` → ElevenLabs API → WebSocket connection
- `ConversationProvider` wraps the app in `providers.tsx`
- `useConversation` hook in `components/VoiceInterface.tsx` manages session lifecycle
- Transcript collected via `onMessage` callback, sent to server on session end

## Gemini Integration
- `lib/gemini.ts` contains all Gemini AI logic
- `extractFromTranscript(transcript)` — parses voice transcripts into structured medication, symptom, and emotion data
- `parsePrescription(base64Data, mimeType)` — OCR for prescription images/PDFs via Gemini vision
- Uses `gemini-2.5-flash` model for both extraction and OCR
- Structured JSON output via prompt engineering (not JSON mode)

## Common Commands
```bash
npm install          # Install dependencies
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run lint         # Lint
npm run test         # Run tests (single run, no watch)
npm run test:watch   # Run tests (watch mode)
npx vitest --run     # Alternative: run tests single run
```

## Environment Variables
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (browser client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side, bypasses RLS) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key (server-side, for signed URLs) |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs Conversational AI agent ID |
| `GEMINI_API_KEY` | Google Gemini API key for extraction and OCR |

## Database Schema (Current)
- `users` — id, name, role (elder/caretaker)
- `assignments` — elder_id, caretaker_id
- `prescriptions` — doctor info, patient info, dates, advice
- `medicines` — name, dosage, quantity, frequency, times[], instructions, with_food
- `conversations` — transcript, extracted (JSONB), emotion, alert_level, alert_reason, acknowledged
- `medication_logs` — elder_id, medicine_name, status (taken/missed), per-day tracking
- `patient_summary` — cached summary for fast reads

## Testing Conventions
- Property-based tests use `fast-check` with `vitest`
- Pure business logic in `lib/` is tested with PBT (decision engine)
- Test files in `lib/__tests__/`
- Decision engine is intentionally a pure function (no DB calls) for testability
