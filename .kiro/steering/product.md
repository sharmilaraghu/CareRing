# CareRing — Product Overview

CareRing is a voice-first emotional care companion for elderly parents living alone. It uses ElevenLabs Conversational AI with a warm companion persona ("Rosie") to conduct health check-ins, and Gemini AI for intelligent data extraction from conversations and prescriptions.

## Core Pillars
- **Medication Adherence** — tracks taken, missed, or skipped medications via voice check-ins and manual UI logging
- **Symptom Monitoring** — captures symptoms with severity from voice conversations; displays history to caretakers
- **Emotional Wellness** — detects emotional state (happy, good, sad, anxious, neutral) from conversations and manual mood check-ins

## How It Works
1. Elder talks to Rosie (ElevenLabs voice agent) or manually logs mood/medication status
2. Conversation transcript → Gemini 2.5 Flash extraction → structured data (medications, symptoms, emotion)
3. Decision engine evaluates extracted data → generates severity-based alerts (low/medium/high)
4. Caretaker views alerts, medication status, symptoms, and mood on their dashboard
5. Caretakers can upload prescriptions (image/PDF) → Gemini vision OCR → auto-populate medicines

## Users
- **Elders** — voice interaction + dashboard via `/elder` (accessible, large touch targets, mood tracker, medicine timeline)
- **Caretakers / Family** — manage medicines, upload prescriptions, view alerts and patient summary via `/caretaker`

## Scope
- 2-day hackathon MVP
- Mobile-first web app in phone-sized viewport (max-width 430px)
- Desktop: displayed in a phone frame mockup with description panel
- Both roles share one app with simple role selection on landing page (no auth)
- Demo flow: Voice Check-In → Gemini Extraction → Decision Engine → Alert → Caretaker Dashboard
- Prescription Upload → Gemini Vision OCR → Auto-populate Medicines
