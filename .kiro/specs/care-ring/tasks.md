# Implementation Plan: CareRing

## Overview

CareRing is a voice-first emotional care companion built with Next.js 15 App Router, Supabase, ElevenLabs Conversational AI, and Google Gemini 2.5 Flash. The implementation covers: types and pure business logic, Gemini AI integration, database schema, API routes, and UI components for both elder and caretaker dashboards.

## Tasks

- [x] 1. Project scaffolding and core type definitions
  - [x] 1.1 Initialize Next.js project with Tailwind CSS and install dependencies
    - Next.js 15 with App Router and Tailwind CSS v4
    - Installed: `@supabase/supabase-js`, `@supabase/ssr`, `@elevenlabs/react`, `@google/generative-ai`, `uuid`
    - Installed dev: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`
    - Configured `vitest.config.ts` with path aliases matching `tsconfig.json`

  - [x] 1.2 Define core TypeScript types and interfaces
    - Created `lib/types.ts` with all domain types: `AlertLevel`, `MedStatus`, `Severity`, `Emotion`
    - Defined interfaces: `Prescription`, `Medicine`, `Conversation`, `MedicationLog`, `Symptom`, `MoodLog`, `Alert`, `ExtractedData`, `PatientSummary`

  - [x] 1.3 Set up Supabase client utilities
    - Created `lib/supabase/client.ts` for browser-side Supabase client (`@supabase/ssr`)
    - Created `lib/supabase/server.ts` for server-side Supabase client (service role key, no RLS)
    - Configured environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

- [x] 2. Implement DecisionEngine (pure business logic)
  - [x] 2.1 Implement `evaluate` function in `lib/decisionEngine.ts`
    - Pure function: takes `ExtractedData`, returns `AlertResult | null`
    - Medication rules: any missed → level "medium"
    - Symptom rules: any high severity → level "high"
    - Emotional wellness: sad or anxious → level "low"
    - Combines multiple triggers with highest severity; joins reasons with "; "
    - Helper `higher(a, b)` for severity comparison

  - [x] 2.2 Write property-based tests for decision engine
    - **Property 1: Medication alert severity** — missed meds → at least medium
    - **Property 2: Symptom alert severity** — high severity symptom → high alert
    - **Property 3: No-trigger returns null** — no triggers → null
    - **Property 4: Structural invariants** — valid level + non-empty reason
    - **Property 5: Severity ordering** — highest trigger level wins

- [x] 3. Implement Gemini AI integration
  - [x] 3.1 Implement `extractFromTranscript` in `lib/gemini.ts`
    - Uses Gemini 2.5 Flash to parse transcripts into `ExtractedData`
    - Prompt engineering for structured JSON output
    - Returns safe fallback on error: `{ medications: [], symptoms: [], emotion: 'neutral' }`

  - [x] 3.2 Implement `parsePrescription` in `lib/gemini.ts`
    - Uses Gemini 2.5 Flash vision for prescription OCR
    - Accepts base64 image/PDF data
    - Extracts: doctor info, patient info, dates, advice, medicines with inferred times
    - Returns safe fallback on error

- [x] 4. Set up Supabase database schema
  - [x] 4.1 Create database migrations
    - `003_final_schema.sql`: users, assignments, prescriptions, medicines, conversations, patient_summary tables
    - `004_medication_logs.sql`: medication_logs table for daily taken/missed tracking
    - Indexes on conversations (elder_id, created_at), medicines (elder_id), prescriptions (elder_id)
    - `patient_overview` view joining users, assignments, conversations, medicines, prescriptions
    - No RLS — service role key used server-side

- [x] 5. Implement API routes
  - [x] 5.1 Implement signed URL route (`app/api/signed-url/route.ts`)
    - GET — returns ElevenLabs signed URL for WebSocket connection
    - Edge runtime for low latency
    - Validates `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` and `ELEVENLABS_API_KEY`

  - [x] 5.2 Implement analyze conversation route (`app/api/analyze-conversation/route.ts`)
    - POST — transcript + elderId → Gemini extraction → decision engine → save conversation + update patient_summary
    - Returns extracted data and alert result

  - [x] 5.3 Implement medication log routes (`app/api/medication-log/route.ts`)
    - POST — log medicine as taken/missed (one entry per medicine per day, replaces existing)
    - GET — fetch today's medication logs for an elder

  - [x] 5.4 Implement medicine routes (`app/api/medicine/`)
    - POST `/api/medicine` — add new medicine (requires name + dosage)
    - PUT `/api/medicine/[id]` — update existing medicine
    - DELETE `/api/medicine/[id]` — delete medicine

  - [x] 5.5 Implement mood route (`app/api/mood/route.ts`)
    - POST — save mood as conversation record with manual entry source

  - [x] 5.6 Implement patient summary route (`app/api/patient-summary/route.ts`)
    - GET — aggregated data: elder name, prescription, medicines, conversations (last 10), symptoms from extracted data, mood, alerts (from conversations with alert_level), medication logs (today)

  - [x] 5.7 Implement alert acknowledge route (`app/api/alerts/acknowledge/route.ts`)
    - POST — mark conversation as acknowledged

  - [x] 5.8 Implement prescription upload route (`app/api/upload-prescription/route.ts`)
    - POST — FormData (file + elderId) → Gemini OCR → insert prescription + upsert medicines

- [x] 6. Implement App Shell and landing page
  - [x] 6.1 Implement root layout (`app/layout.tsx`)
    - Mobile viewport meta tags
    - Phone frame CSS wrapper for desktop
    - Description panel with feature overview
    - Google Fonts: DM Serif Display + Nunito
    - ElevenLabs ConversationProvider wrapper (`app/providers.tsx`)

  - [x] 6.2 Implement landing page (`app/page.tsx`)
    - Role selection: "I need care" (elder) and "I give care" (caretaker)
    - Gradient backgrounds with decorative elements
    - Navigation to `/elder` or `/caretaker`

- [x] 7. Implement Elder Dashboard
  - [x] 7.1 Implement elder page (`app/elder/page.tsx`)
    - Two tabs: Dashboard and Talk to Rosie
    - Polling refresh every 30 seconds + on window focus
    - Hardcoded elder ID for demo
    - Time-of-day greeting with elder's first name
    - Alert toast after conversation analysis

  - [x] 7.2 Implement VoiceInterface hook (`components/VoiceInterface.tsx`)
    - Custom hook wrapping ElevenLabs `useConversation`
    - Status management: idle → micRequested → connecting → connected → idle
    - Transcript collection via onMessage callback
    - Signed URL fetching from `/api/signed-url`

  - [x] 7.3 Implement TalkButton (`components/elder/TalkButton.tsx`)
    - Start/stop voice session button
    - Waveform animation when connected
    - Pulse animation when connecting
    - Status-specific labels

  - [x] 7.4 Implement MedicineTimeline (`components/elder/MedicineTimeline.tsx`)
    - Timeline view of today's medicines sorted by time
    - Status priority: manual log > voice-reported > time-based inference
    - "Took it" / "Missed" buttons with API integration
    - Browser TTS reminder for missed medicines
    - Color-coded status indicators

  - [x] 7.5 Implement MoodTracker (`components/elder/MoodTracker.tsx`)
    - Five emoji mood options with API persistence
    - Visual highlight on selected mood

  - [x] 7.6 Implement AlertsBadge (`components/elder/AlertsBadge.tsx`)
    - Active alert count and highest severity display
    - Color-coded by severity level

  - [x] 7.7 Implement DoctorGuidelines (`components/elder/DoctorGuidelines.tsx`)
    - Doctor advice display from prescription
    - Follow-up date display

  - [x] 7.8 Implement AssistantHelp (`components/elder/AssistantHelp.tsx`)
    - "Talk to Rosie" prompt card with topic suggestions

  - [x] 7.9 Implement supporting elder components
    - MoodCard — last mood display
    - MoodCheckIn — mood selection (alternative to MoodTracker)
    - MedicinesCard — simple medicine list with status
    - HealthReminders — static daily health reminders
    - SimulateReminderButton — browser TTS medicine reminder demo

- [x] 8. Implement Caretaker Dashboard
  - [x] 8.1 Implement caretaker page (`app/caretaker/page.tsx`)
    - Card-based vertically scrollable layout
    - Polling refresh every 30 seconds with manual refresh button
    - Hardcoded elder ID for demo
    - Active alerts callout at top
    - First-time banner when no medicines exist

  - [x] 8.2 Implement PrescriptionUploader (`components/caretaker/PrescriptionUploader.tsx`)
    - Drag-and-drop or tap-to-upload for images and PDFs
    - Upload progress indicator
    - Success/error feedback

  - [x] 8.3 Implement PrescriptionCard (`components/caretaker/PrescriptionCard.tsx`)
    - Doctor info, prescription date, patient age
    - Follow-up date with urgency indicator (urgent/soon/ok)
    - Doctor advice display
    - Medicine list with times and food instructions

  - [x] 8.4 Implement PatientSummaryCards (`components/caretaker/PatientSummaryCards.tsx`)
    - 2x2 grid: medicines count, recent symptoms, mood, active alerts
    - Color-coded backgrounds based on status

  - [x] 8.5 Implement MedicineManager (`components/caretaker/MedicineManager.tsx`)
    - Add/edit/remove medicine forms
    - Fields: name, dosage, quantity, frequency, time, instructions, with_food
    - Inline form with validation

  - [x] 8.6 Implement AlertsList (`components/caretaker/AlertsList.tsx`)
    - Active alerts with acknowledge buttons
    - Acknowledged alerts section (collapsed, last 3)
    - Severity-colored indicators

  - [x] 8.7 Implement SymptomsHistory (`components/caretaker/SymptomsHistory.tsx`)
    - Chronological symptom list from conversations
    - Severity badges with color coding

- [x] 9. Global styles and CSS
  - [x] 9.1 Implement globals.css
    - CSS custom properties for color palette (cream, brown, terracotta, sage, amber)
    - Phone frame mockup styles for desktop
    - Card vintage style with borders and shadows
    - Animation keyframes (fade-in, fade-up, wiggle, wave-bar, pulse-ring)
    - Badge styles for severity levels
    - Responsive layout for desktop description panel

- [x] 10. Contextual Voice Agent with Client Tools
  - [x] 10.1 Implement ElderContext builder (`lib/elderContext.ts`)
    - `buildElderContext(summary)` builds context from PatientSummary
    - Computes medicine statuses (taken/missed/due/upcoming) from logs + current time
    - Generates system prompt context block with elder name, medicines, symptoms, mood
    - Generates personalized first message (greets by name, asks about due/missed meds)
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 10.2 Update VoiceInterface to support client tools and overrides
    - Added `clientTools` and `overrides` props to `useVoiceInterface`
    - Passes `clientTools` map to `startSession` for mid-conversation tool calls
    - Passes `overrides.agent.prompt` and `overrides.agent.firstMessage` for context injection
    - _Requirements: 14.4, 14.9_

  - [x] 10.3 Update TalkButton to pass through client tools and overrides
    - Added `clientTools` and `overrides` props, forwarded to `useVoiceInterface`
    - _Requirements: 14.4_

  - [x] 10.4 Wire client tools in Elder Dashboard
    - `getMedicationSchedule` — fetches medicines with real-time status via `/api/patient-summary`
    - `getRecentSymptoms` — fetches last 5 symptoms via `/api/patient-summary`
    - `getEmotionalHistory` — fetches latest mood via `/api/patient-summary`
    - `logMedicationStatus` — POSTs to `/api/medication-log`, refreshes dashboard
    - All tools built with `useMemo` for stable references
    - _Requirements: 14.5, 14.6, 14.7, 14.8_

  - [x] 10.5 Configure ElevenLabs agent dashboard
    - Added 4 client tools in ElevenLabs dashboard with correct parameter schemas
    - Updated system prompt with tool usage instructions and conversation flow
    - Enabled system prompt and first message overrides in Security tab
    - Enabled Skip turn system tool for natural conversation pacing
    - _Requirements: 14.4, 14.5, 14.6, 14.7, 14.8_

## Notes

- All tasks are complete — the app is a functional hackathon MVP with contextual voice agent
- No authentication implemented — simple role selection on landing page
- Hardcoded elder ID (`e0000000-0000-0000-0000-000000000001`) for demo
- Decision engine is a pure function for testability
- Gemini 2.5 Flash used for both transcript extraction and prescription OCR
- Polling-based refresh (30s) instead of Supabase realtime subscriptions
- Browser TTS used for medicine reminders (not ElevenLabs)
- Testing stack: vitest + fast-check for PBT on decision engine
- ElevenLabs agent enhanced with 4 client tools for contextual conversations
- Session overrides inject elder context (medicines, symptoms, mood) at session start
- `logMedicationStatus` client tool enables voice-driven medication logging that updates the dashboard in real time
