# CareRing — Project Structure

## Current Layout
```
.
├── .kiro/
│   ├── specs/care-ring/       # Feature spec (requirements, design, tasks)
│   ├── steering/              # AI steering rules (product, structure, tech)
│   └── hooks/                 # Agent hooks
├── app/
│   ├── layout.tsx             # App Shell — mobile viewport, phone frame, description panel
│   ├── page.tsx               # Landing page — role selection (elder / caretaker)
│   ├── providers.tsx          # ElevenLabs ConversationProvider wrapper
│   ├── globals.css            # Global styles, CSS variables, animations
│   ├── elder/
│   │   └── page.tsx           # Elder dashboard — mood, medicines, voice, alerts
│   ├── caretaker/
│   │   └── page.tsx           # Caretaker dashboard — prescriptions, medicines, alerts, symptoms
│   └── api/
│       ├── alerts/acknowledge/route.ts   # POST — acknowledge alert (mark conversation acknowledged)
│       ├── analyze-conversation/route.ts # POST — transcript → Gemini extraction → decision engine → save
│       ├── medication-log/route.ts       # GET/POST — daily medication taken/missed logging
│       ├── medicine/route.ts             # POST — add medicine
│       ├── medicine/[id]/route.ts        # PUT/DELETE — update/remove medicine
│       ├── mood/route.ts                 # POST — manual mood entry
│       ├── patient-summary/route.ts      # GET — aggregated patient data for dashboards
│       ├── signed-url/route.ts           # GET — ElevenLabs signed URL for voice session
│       └── upload-prescription/route.ts  # POST — prescription image/PDF → Gemini OCR → medicines
├── components/
│   ├── VoiceInterface.tsx     # ElevenLabs useConversation hook wrapper (custom hook)
│   ├── elder/
│   │   ├── AlertsBadge.tsx    # Active alerts display
│   │   ├── AssistantHelp.tsx  # "Talk to Rosie" prompt card
│   │   ├── DoctorGuidelines.tsx # Doctor advice from prescription
│   │   ├── HealthReminders.tsx  # Static daily health reminders
│   │   ├── MedicinesCard.tsx    # Simple medicine list with status
│   │   ├── MedicineTimeline.tsx # Timeline view with taken/missed buttons
│   │   ├── MoodCard.tsx         # Last mood display
│   │   ├── MoodCheckIn.tsx      # Mood selection (emoji buttons)
│   │   ├── MoodTracker.tsx      # Mood tracker with API integration
│   │   ├── SimulateReminderButton.tsx # Browser TTS medicine reminder
│   │   └── TalkButton.tsx       # Voice session start/stop button
│   └── caretaker/
│       ├── AlertsList.tsx       # Alert list with acknowledge buttons
│       ├── MedicineManager.tsx  # CRUD form for medicines
│       ├── PatientSummaryCards.tsx # Summary grid (medicines, symptoms, mood, alerts)
│       ├── PrescriptionCard.tsx   # Prescription details display
│       ├── PrescriptionUploader.tsx # Drag-and-drop prescription upload
│       └── SymptomsHistory.tsx    # Symptom history list
├── lib/
│   ├── types.ts               # All TypeScript domain types
│   ├── decisionEngine.ts      # Alert evaluation (pure function)
│   ├── gemini.ts              # Gemini AI — transcript extraction + prescription OCR
│   ├── supabase/
│   │   ├── client.ts          # Browser-side Supabase client (@supabase/ssr)
│   │   └── server.ts          # Server-side Supabase client (service role key)
│   └── __tests__/
│       ├── fast-check-setup.test.ts  # fast-check PBT setup verification
│       └── setup.test.ts             # Basic test setup verification
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_lean_schema.sql
│   │   ├── 003_final_schema.sql    # Current schema — users, prescriptions, medicines, conversations, patient_summary
│   │   └── 004_medication_logs.sql # Medication taken/missed tracking
│   ├── seed.sql
│   └── docs/
│       ├── dummy_prescription.pdf
│       └── prescription_schema.py
├── docs/
│   └── elevenlabs-docs/       # ElevenLabs reference docs (API, Agents, Creative)
├── middleware.ts               # Pass-through middleware (no auth enforcement)
├── vitest.config.ts           # Vitest config with path aliases
└── package.json
```

## Conventions
- API routes under `app/api/` using Next.js App Router conventions
- Business logic in `lib/` as pure, testable functions where possible
- UI components split into `components/elder/` and `components/caretaker/` folders
- `lib/decisionEngine.ts` is a pure function — no DB calls, no side effects
- `lib/gemini.ts` handles all AI interactions (extraction + OCR)
- Database interactions through Supabase client, not raw SQL
- Server-side uses service role key (no RLS) for simplicity
- Reference `docs/elevenlabs-docs/` when working on voice features
- Mobile-first design: max-width 430px, phone frame mockup on desktop
- No authentication — simple role selection on landing page
- Hardcoded elder ID for demo purposes
