# Requirements Document

## Introduction

CareRing is a voice-first emotional care companion for parents and elders staying alone, away from their families. At its heart, CareRing is someone emotionally available and caring — like having a loving family member check in every day. The system uses a personality-driven ElevenLabs voice agent named "Rosie" that speaks with warmth and empathy, creating a comforting emotional connection.

CareRing is built around three core pillars: **Medication Adherence**, **Symptom Monitoring**, and **Emotional Wellness**. The elder can talk to Rosie about their medications, symptoms, and how they're feeling. The system extracts structured health data from conversations using Gemini AI, evaluates decision rules to generate alerts, and presents everything on a caretaker dashboard.

Additionally, caretakers can upload prescription documents (images or PDFs) which are parsed by Gemini vision OCR to automatically populate the medicine list. Elders can also manually log their mood and medication status through the UI.

The application is a **mobile-first web app** — a single web application rendered in a phone-sized viewport (max-width 430px), designed for both elders and caretakers. Both roles use the same app with a simple role selection landing page: elders see the elder dashboard (`/elder`), and caretakers see the caretaker dashboard (`/caretaker`). On desktop browsers, the app is displayed within a mobile phone frame mockup with a description panel.

This is a 2-day hackathon MVP. The core demo flow is: **Voice Check-In → Gemini Extraction → Decision Engine → Alert → Caretaker Dashboard**. A secondary flow is: **Prescription Upload → Gemini Vision OCR → Auto-populate Medicines**.

## Glossary

- **App_Shell**: The mobile-first web application layout that serves both elder and caretaker roles, with a phone frame mockup on desktop and a description panel
- **Mobile_Viewport**: The phone-sized frame (max-width 430px) in which the web app is rendered; on desktop browsers, the app is displayed within a phone frame mockup
- **Voice_Interface**: The custom hook (`useVoiceInterface`) that wraps ElevenLabs `useConversation` to manage voice sessions — mic access, signed URL fetching, transcript collection, and session lifecycle
- **Rosie**: The voice companion persona — warm, caring, and health-focused — powered by ElevenLabs Conversational AI
- **Gemini_Extractor**: The server-side component (`lib/gemini.ts`) that uses Gemini 2.5 Flash to parse conversation transcripts into structured medication, symptom, and emotion data
- **Prescription_OCR**: The server-side component (`lib/gemini.ts`) that uses Gemini 2.5 Flash vision to parse prescription images/PDFs into structured doctor info and medicine data
- **Decision_Engine**: The pure function (`lib/decisionEngine.ts`) that evaluates extracted data to determine alert severity and reason
- **Caretaker_Dashboard**: The mobile-first web interface (`/caretaker`) where caretakers view prescriptions, manage medicines, see alerts, patient summary, and symptom history
- **Elder_Dashboard**: The mobile-first web interface (`/elder`) with two tabs: a dashboard (mood tracker, medicine timeline, doctor guidelines, alerts) and a "Talk to Rosie" voice interaction tab
- **ExtractedData**: A structured object containing arrays of medication statuses, symptom reports, and detected emotion from a conversation
- **Medicine**: A medication record with name, dosage, quantity, frequency, scheduled times, instructions, and food requirements
- **Prescription**: Metadata from an uploaded prescription document — doctor info, patient info, dates, and advice
- **Conversation**: A voice check-in record containing transcript, extracted data, detected emotion, alert level, and acknowledgment status
- **MedicationLog**: A daily record of whether a specific medicine was taken or missed, logged manually by the elder
- **Alert**: A notification derived from conversation analysis with severity level (low/medium/high) and reason
- **PatientSummary**: An aggregated view of the elder's current state — medicines, latest conversation, mood, symptoms, alerts, and medication logs

---

## Core MVP Requirements

### Requirement 1: Voice Conversation with Rosie

**User Story:** As an elderly user, I want to talk naturally to Rosie about my medications, how my body feels, and how I'm doing emotionally, so that the system can understand my well-being without requiring me to use a screen or keyboard.

#### Acceptance Criteria

1. WHEN the elder taps "Talk to Rosie" on the elder dashboard, THE Voice_Interface SHALL request microphone permission and initiate a voice session with the ElevenLabs agent
2. WHEN starting a session, THE Voice_Interface SHALL fetch a signed URL from `/api/signed-url` to keep the ElevenLabs API key server-side
3. WHEN the voice session is active, THE Voice_Interface SHALL collect transcript turns via the `onMessage` callback, labeling each as "User" or "Companion"
4. WHEN the elder ends the session (tap stop button), THE Voice_Interface SHALL compile the full transcript and pass it to the session end handler
5. WHEN the session ends with a non-empty transcript, THE Elder_Dashboard SHALL send the transcript to `/api/analyze-conversation` for extraction and evaluation
6. IF the Voice_Interface fails to get microphone permission or signed URL, THEN THE Voice_Interface SHALL display an error and return to idle state
7. WHEN a session is active, THE Elder_Dashboard SHALL display a waveform animation and a "Tap to stop" button
8. WHEN connecting, THE Elder_Dashboard SHALL display a pulsing indicator

### Requirement 2: Structured Data Extraction from Transcripts

**User Story:** As the system, I want to extract structured medication, symptom, and emotional wellness data from conversation transcripts, so that downstream decision logic can evaluate the data programmatically.

#### Acceptance Criteria

1. WHEN a conversation transcript is submitted to `/api/analyze-conversation`, THE Gemini_Extractor SHALL parse the transcript using Gemini 2.5 Flash and produce an ExtractedData object
2. THE ExtractedData object SHALL contain: an array of medication objects (name, status), an array of symptom objects (name, duration, severity), and an emotion string
3. EACH medication object SHALL have a `name` (string) and `status` (one of: taken, missed, unknown)
4. EACH symptom object SHALL have a `name` (string), `duration` (string), and `severity` (one of: low, medium, high)
5. THE emotion SHALL be one of: happy, sad, anxious, neutral
6. IF the Gemini_Extractor fails or returns invalid data, THEN THE system SHALL use a fallback with empty arrays and "neutral" emotion
7. THE extracted data SHALL be stored in the `conversations` table as a JSONB `extracted` field alongside the raw transcript

### Requirement 3: Decision Rule Evaluation

**User Story:** As a family member, I want the system to evaluate my loved one's conversation data and generate alerts when something needs attention.

#### Acceptance Criteria

1. WHEN the Gemini_Extractor produces an ExtractedData object, THE Decision_Engine SHALL evaluate it and return an alert result or null
2. WHEN any medication has status "missed", THE Decision_Engine SHALL generate an alert with level "medium"
3. WHEN any symptom has severity "high", THE Decision_Engine SHALL escalate the alert to level "high"
4. WHEN the detected emotion is "sad" or "anxious", THE Decision_Engine SHALL include emotional distress in the alert reason
5. THE Decision_Engine SHALL combine multiple triggers into a single alert with the highest applicable severity level
6. IF no triggers are detected (no missed meds, no high symptoms, no emotional distress), THE Decision_Engine SHALL return null (no alert)
7. THE alert result SHALL include a `level` (low/medium/high) and a human-readable `reason` string describing all triggers

### Requirement 4: Prescription Upload and OCR

**User Story:** As a caretaker, I want to upload a prescription document so that medicines are automatically extracted and added to the elder's medicine list.

#### Acceptance Criteria

1. WHEN a caretaker uploads an image or PDF via the Caretaker_Dashboard, THE system SHALL send it to `/api/upload-prescription`
2. THE Prescription_OCR SHALL parse the document using Gemini 2.5 Flash vision and extract: doctor name, qualification, clinic, patient name, age, prescription date, follow-up date, doctor advice, and a list of medicines
3. EACH extracted medicine SHALL include: name, dosage, quantity, frequency, times (inferred from instructions), instructions, and with_food flag
4. THE system SHALL insert a new prescription record and upsert medicines (update existing by name, insert new ones)
5. IF a medicine with the same name already exists for the elder, THE system SHALL update its details from the new prescription
6. IF the Gemini OCR fails, THE system SHALL return a fallback with "Unknown" doctor/patient and empty medicines array
7. THE Caretaker_Dashboard SHALL display the parsed prescription details and updated medicine list after upload

### Requirement 5: Medicine Management

**User Story:** As a caretaker, I want to add, edit, and remove medicines for my loved one, so that their medication schedule is always up to date.

#### Acceptance Criteria

1. WHEN a caretaker adds a medicine via the Caretaker_Dashboard, THE system SHALL accept name, dosage, quantity, frequency, time, instructions, and with_food flag
2. WHEN a caretaker edits an existing medicine, THE system SHALL update the medicine record with new values
3. WHEN a caretaker removes a medicine, THE system SHALL delete the medicine record
4. THE system SHALL validate that name and dosage are required fields
5. THE Caretaker_Dashboard SHALL display all medicines with edit and delete controls

### Requirement 6: Medication Status Logging

**User Story:** As an elderly user, I want to mark each medicine as taken or missed directly on my dashboard, so that my caretaker can see my adherence without needing a voice check-in.

#### Acceptance Criteria

1. WHEN the elder views the medicine timeline, THE Elder_Dashboard SHALL display each medicine with "Took it" and "Missed" buttons
2. WHEN the elder taps "Took it" or "Missed", THE system SHALL save a medication log entry for that medicine for today
3. THE system SHALL allow only one log entry per medicine per day (replacing any existing entry)
4. THE medicine timeline SHALL show the logged status (taken/missed) and hide the action buttons once logged
5. THE medicine timeline SHALL also reflect status from voice conversation extraction when no manual log exists
6. THE medicine timeline SHALL infer time-based status (due, upcoming, missed) based on scheduled times when no other status is available

### Requirement 7: Mood Tracking

**User Story:** As an elderly user, I want to quickly log how I'm feeling with a simple tap, so that my caretaker can monitor my emotional wellness.

#### Acceptance Criteria

1. THE Elder_Dashboard SHALL display a mood tracker with emoji buttons for: happy (😊), good (🙂), okay (😐), low (😔), and anxious (😰)
2. WHEN the elder taps a mood emoji, THE system SHALL save the mood as a conversation record via `/api/mood`
3. THE mood tracker SHALL visually highlight the selected mood
4. THE Caretaker_Dashboard SHALL display the latest mood in the patient summary cards

### Requirement 8: Alert Notification and Acknowledgment

**User Story:** As a caretaker, I want to see alerts from my loved one's check-ins and acknowledge them, so that I know when something needs my attention.

#### Acceptance Criteria

1. WHEN the Decision_Engine generates an alert, THE system SHALL store the alert level and reason in the conversation record
2. THE Caretaker_Dashboard SHALL display unacknowledged alerts prominently at the top with severity-colored styling
3. THE Caretaker_Dashboard SHALL display an alerts list with active and acknowledged sections
4. WHEN a caretaker taps "Done" on an alert, THE system SHALL mark the conversation as acknowledged
5. THE Elder_Dashboard SHALL display an alerts badge showing the count and highest-severity unacknowledged alert
6. ALERTS SHALL be color-coded: high (red), medium (amber), low (green)

### Requirement 9: Patient Summary Dashboard

**User Story:** As a caretaker, I want a centralized view of my loved one's health data, so that I can stay informed at a glance.

#### Acceptance Criteria

1. THE Caretaker_Dashboard SHALL display summary cards showing: medicine count, recent symptoms, current mood, and active alert count
2. THE Caretaker_Dashboard SHALL display a symptom history list with severity indicators
3. THE Caretaker_Dashboard SHALL auto-refresh data every 30 seconds
4. THE Elder_Dashboard SHALL display: mood tracker, medicine timeline with today's schedule, doctor guidelines from prescription, and an assistant help card
5. THE Elder_Dashboard SHALL auto-refresh data every 30 seconds and on window focus

### Requirement 10: Elder Dashboard Layout

**User Story:** As an elderly user, I want a simple, accessible interface with large touch targets, so that I can easily interact with the app.

#### Acceptance Criteria

1. THE Elder_Dashboard SHALL have two tabs: "Dashboard" and "Talk to Rosie"
2. THE Dashboard tab SHALL display: alerts badge, mood tracker, medicine timeline, doctor guidelines, and assistant help card
3. THE "Talk to Rosie" tab SHALL display the voice session controls and last conversation summary
4. ALL interactive elements SHALL have minimum 48x48px touch targets
5. THE Elder_Dashboard SHALL display a greeting based on time of day and the elder's first name
6. THE Elder_Dashboard SHALL use high-contrast colors and minimum 14px text for readability

### Requirement 11: App Shell and Mobile Viewport

**User Story:** As a user, I want the app to look and feel like a mobile app regardless of my device.

#### Acceptance Criteria

1. THE App_Shell SHALL render all content within a max-width 430px container
2. ON desktop, THE App_Shell SHALL display the content within a phone frame mockup with a description panel alongside
3. THE description panel SHALL describe CareRing's features for both elders and caretakers
4. THE landing page SHALL provide two role selection buttons: "I need care" (elder) and "I give care" (caretaker)
5. THE App_Shell SHALL wrap all content in an ElevenLabs ConversationProvider

### Requirement 12: Doctor Guidelines Display

**User Story:** As an elderly user, I want to see my doctor's advice and follow-up date on my dashboard, so that I remember important medical guidance.

#### Acceptance Criteria

1. WHEN a prescription with doctor advice exists, THE Elder_Dashboard SHALL display the advice in a highlighted card
2. WHEN a follow-up date exists, THE Elder_Dashboard SHALL display it with the date formatted
3. IF no prescription or advice exists, THE Elder_Dashboard SHALL display a placeholder message

### Requirement 13: Symptom History

**User Story:** As a caretaker, I want to see a history of reported symptoms with severity levels, so that I can track health patterns.

#### Acceptance Criteria

1. THE Caretaker_Dashboard SHALL display symptoms extracted from recent conversations
2. EACH symptom SHALL show: name, duration, and severity level with color-coded indicator
3. SYMPTOMS SHALL be displayed in reverse chronological order
4. SEVERITY levels SHALL be color-coded: high (red), medium (amber), low (green)

### Requirement 14: Contextual Voice Agent with Client Tools

**User Story:** As an elderly user, I want Rosie to know my medication schedule, recent symptoms, and mood when we talk, so that the conversation feels personal and she can ask me about specific medicines by name.

#### Acceptance Criteria

1. WHEN a voice session starts, THE system SHALL build an elder context from the PatientSummary containing: elder name, current time, today's medicine schedule with statuses, due/missed medicines, recent symptoms, last mood, and last check-in time
2. THE system SHALL inject the elder context into the ElevenLabs agent via system prompt override and first message override at session start
3. THE first message SHALL be personalized — greeting the elder by name and asking about a specific due/missed medicine if one exists
4. THE Voice_Interface SHALL register four client tools with the ElevenLabs agent: `getMedicationSchedule`, `getRecentSymptoms`, `getEmotionalHistory`, and `logMedicationStatus`
5. WHEN Rosie calls `getMedicationSchedule`, THE client tool SHALL fetch the elder's current medicines with real-time taken/missed/due/upcoming status and return it to the agent
6. WHEN Rosie calls `getRecentSymptoms`, THE client tool SHALL fetch the last 5 symptoms from recent conversations and return them to the agent
7. WHEN Rosie calls `getEmotionalHistory`, THE client tool SHALL fetch the elder's latest mood and return it to the agent
8. WHEN the elder confirms taking or missing a medicine during conversation, Rosie SHALL call `logMedicationStatus` with the medicine name and status, which SHALL POST to `/api/medication-log` and refresh the dashboard
9. IF the system prompt override or first message override fails, THE Voice_Interface SHALL fall back to the default agent prompt and first message configured in the ElevenLabs dashboard

---

## Correctness Properties

### Property 1: Decision engine alert severity

*For any* ExtractedData object:
- If any medication has status "missed", the decision engine SHALL produce an alert with level at least "medium"
- If any symptom has severity "high", the decision engine SHALL produce an alert with level "high"
- If no medications are missed, no symptoms are high severity, and emotion is not sad/anxious, the decision engine SHALL return null

### Property 2: Decision engine combines triggers correctly

*For any* ExtractedData with multiple triggers (missed meds + high symptoms + emotional distress), the decision engine SHALL return the highest applicable severity level and include all trigger reasons in the alert reason string.

### Property 3: Decision engine structural invariants

*For any* input to the decision engine, if an alert is returned it SHALL have:
- A valid `level` (one of: low, medium, high)
- A non-empty `reason` string

### Property 4: Gemini extraction fallback safety

*For any* failed Gemini extraction, the system SHALL return a valid ExtractedData with empty medication array, empty symptom array, and "neutral" emotion — never null or undefined.
