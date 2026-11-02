# Candidate Call Screening Workspace - Backend Specification

## Overview
During candidate screening calls (`/call/:candidateId/:jobId` or `/call/:jobId/:candidateId`), recruiters interact with the screening workspace and quick call outcome logging dialogs. This specification outlines all backend endpoints, data models, button triggers, JSON payloads, and database synchronization logic required to support:

1. **Tab 1: Profile Tab** ([`ProfileTab.tsx`](file:///src/pages/companies/components/candidate-call-page/components/ProfileTab.tsx)) — Candidate profile review & editable fields.
2. **Tab 2: Skills Match Tab** ([`SkillsMatchTab.tsx`](file:///src/pages/companies/components/candidate-call-page/components/SkillsMatchTab.tsx)) — Must-have / Good-to-have skill match evaluation, button click triggers & instant feedback persistence.
3. **Tab 3: Notes Tab** ([`NotesTab.tsx`](file:///src/pages/companies/components/candidate-call-page/components/NotesTab.tsx)) — Chat-style candidate notes logging & retrieval.
4. **Call Ended Early Dialog** ([`CallEndedEarlyDialog.tsx`](file:///src/pages/companies/components/candidate-call-page/components/CallEndedEarlyDialog.tsx)) — Automated outcome logging when a call finishes in $\le$ 70s / under 1m 20s.

*(Note: Role Questions and Job Description tabs are already implemented and are excluded from this specification).*

---

## 1. Tab 1: Profile Tab (`ProfileTab.tsx`)

Recruiters review and update candidate screening fields (Notice Period, Serving Status **CS / NS**, Last Working Day, CTC, Reason for Change, Location, and Experience).

### 1.1 Candidate Model Fields
Ensure the following fields exist on the **Candidate** model:

```python
# Candidate Model (models.py)
class Candidate(models.Model):
    # Compensation & Notice
    current_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Current CTC in LPA")
    expected_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Expected CTC in LPA")
    notice_period_days = models.IntegerField(null=True, blank=True, help_text="Notice period in days (e.g. 0, 15, 30, 60)")
    
    # Serving Status (CS: Currently Serving, NS: Not Serving)
    notice_status = models.CharField(max_length=10, default="CS", null=True, blank=True, help_text="'CS' (Currently Serving) or 'NS' (Not Serving)")
    
    # Last Working Day (DateField format: YYYY-MM-DD)
    last_working_day = models.DateField(null=True, blank=True, help_text="Last working date in 'YYYY-MM-DD' format, e.g. '2026-10-31'")
    
    # Location & Relocation
    location = models.CharField(max_length=255, null=True, blank=True)
    open_to_relocate = models.CharField(max_length=20, default="Yes", null=True, blank=True, help_text="'Yes', 'No', or 'Maybe'")
    
    # Experience
    total_experience = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Total experience in years")
    relevant_experience = models.CharField(max_length=50, null=True, blank=True, help_text="e.g. '3Y 3M'")
    
    # Reason for Change
    reason_for_change = models.TextField(null=True, blank=True, help_text="Reason for looking for a job change")
```

### 1.2 Endpoints

#### A. Update Candidate Editable Fields
- **Endpoint**: `PATCH /candidates/{candidate_id}/editable-fields/`
- **Method**: `PATCH`
- **Auth**: Bearer Token

##### Request Payload:
```json
{
  "notice_period_days": 60,
  "notice_status": "CS",
  "last_working_day": "2026-10-31",
  "lwd_days": "14days",
  "current_salary": 23.0,
  "expected_ctc": 30.0,
  "location": "Bangalore",
  "exp": 4.0,
  "relevant_experience": "3Y 3M",
  "open_to_relocate": "Yes",
  "reason_for_change": "Looking for better growth opportunities and product-scale challenges.",
  "name": "Max Verstappen",
  "headline": "Senior Product Designer",
  "company": "Redbull Racing"
}
```

##### Expected Response (`200 OK`):
```json
{
  "status": "success",
  "candidate": {
    "id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
    "full_name": "Max Verstappen",
    "headline": "Senior Product Designer",
    "company": "Redbull Racing",
    "current_salary": 23.0,
    "current_salary_lpa": "23.0 LPA",
    "expected_ctc": 30.0,
    "notice_period_days": 60,
    "notice_period_summary": "60 days",
    "notice_status": "CS",
    "last_working_day": "2026-10-31",
    "lwd_days": "14days",
    "location": "Bangalore",
    "total_experience": 4.0,
    "relevant_experience": "3Y 3M",
    "open_to_relocate": "Yes",
    "reason_for_change": "Looking for better growth opportunities and product-scale challenges."
  }
}
```

#### B. Fetch Candidate Profile GET Endpoints
- `GET /candidates/{candidate_id}/`
- `GET /jobs/applications/{application_id}/` (or `GET /jobs/applications/?job_id={job_id}`)
Ensure nested `candidate` records return `notice_status`, `last_working_day`, `open_to_relocate`, `relevant_experience`, and `reason_for_change`.

---

## 2. Tab 2: Skills Match Tab (`SkillsMatchTab.tsx`)

Recruiters evaluate candidate competencies against the job description. Skills are divided into **Must Have Skills** (missing must-haves listed first with warning tag `"Not in Resume"`) and **Good to Have Skills**.

### 2.1 Button Click Triggers & User Interactions
Each numbered skill card contains a **3-State Feedback Button Group**:

1. **Thumbs Up Button (`<ThumbsUp />`)**:
   - **Click Action**: Marks candidate as **Proficient / Verified** for that skill (`"positive"`).
   - **UI Response**: Card tints light green (`#F0FDF4`), badge highlights solid green (`#16A34A`), and the number indicator turns emerald.
2. **Neutral Button (`<Meh />`)**:
   - **Click Action**: Marks candidate as **Average / Partial Fit** for that skill (`"neutral"`).
   - **UI Response**: Card tints light orange (`#FFF7ED`), badge highlights solid orange (`#EA580C`), and the number indicator turns orange.
3. **Thumbs Down Button (`<ThumbsDown />`)**:
   - **Click Action**: Marks candidate as **Needs Improvement / Not Satisfied** for that skill (`"negative"`).
   - **UI Response**: Card tints light red (`#FEF2F2`), badge highlights solid red (`#DC2626`), and the number indicator turns rose.
4. **Toggle Unselect**:
   - If the recruiter clicks the currently active button a second time, it unselects the rating (reverts value to `null` and resets card to neutral white).

### 2.2 Instant API Trigger on Button Click
Whenever any feedback button is clicked:
1. **Immediate State & Local Storage Save**:
   - Local state is updated immediately (`setFeedback`).
   - Saved to `localStorage` under `_nxthyre_skills_feedback_${candId}_${jobId}` for zero-delay persistence.
2. **Automatic Background API Call (`saveFeedbackToBackend`)**:
   - Dispatches debounced (300ms) call to `POST /api/plivo/call-log/` (`http://localhost:5173/api/plivo/call-log/`).
   - **Frontend Service**: [`saveSkillsFeedback`](file:///src/services/jobPipelineDashboardService.ts#L593) / [`saveCallLog`](file:///src/services/jobPipelineDashboardService.ts#L375).

#### Request Payload:
```json
{
  "candidate_id": "c22044fa-bde0-4a18-b60a-d04f22911b00",
  "call_uuid": "c57e461f-9b26-4571-92f9-3aeaf70c0320",
  "skills_data": {
    "React": "positive",
    "TypeScript": "positive",
    "Next.js": "neutral",
    "GraphQL": "negative",
    "Docker": null
  }
}
```

#### Backend Database Handling:
- **Table**: `call_logs`
- **Column**: `skills_data JSONB NULL`
- The backend accepts the dictionary of skill ratings and stores it directly into the `skills_data` JSONB column.

### 2.3 Restoring Previously Saved Skills Feedback Across Page Loads
When the recruiter opens or refreshes the call page:
1. The frontend checks `localStorage` first.
2. If `localStorage` has no feedback for this candidate/job, it calls:
   - **Endpoint**: `GET /api/plivo/call-log/?candidate_id={candidate_id}&limit=5`
   - **Method**: `GET`
   - **Auth**: Bearer Token
3. It inspects recent `call_logs.skills_data` entries and restores the exact feedback state so the thumbs up/neutral/thumbs down buttons are rendered in their saved active states.

---

## 3. Tab 3: Notes Tab (`NotesTab.tsx`)

Recruiters write and review chat-style notes for the candidate with timestamps (`Today, 09:12 am`), avatars, and author information. The default state is empty until notes are fetched or added.

### 3.1 APIs Called

#### A. Fetch Candidate Notes
- **Frontend Function**: `candidateService.getCandidateNotes(candidateId)`
- **Endpoint**: `GET /candidates/{candidate_id}/notes/`
- **Method**: `GET`
- **Auth**: Bearer Token

##### Expected Response (`200 OK`):
```json
[
  {
    "noteId": "note_101",
    "content": "This candidate stays far from the office premise. Relocation might be needed",
    "postedBy": "Sana Amjad",
    "posted_at": "2026-10-28T09:12:00Z",
    "is_team_note": true,
    "is_community_note": false,
    "organisation": {
      "orgId": "1",
      "orgName": "Nxthyre"
    }
  }
]
```

#### B. Post New Candidate Note
- **Frontend Function**: `candidateService.postCandidateNote(candidateId, payload)`
- **Endpoint**: `POST /candidates/{candidate_id}/notes/`
- **Method**: `POST`
- **Auth**: Bearer Token

##### Request Payload:
```json
{
  "teamNotes": "This candidate stays far from the office premise. Relocation might be needed",
  "is_community_note": false
}
```

##### Expected Response (`201 Created` or `200 OK`):
```json
{
  "noteId": "note_102",
  "content": "This candidate stays far from the office premise. Relocation might be needed",
  "postedBy": "Sana Amjad",
  "posted_at": "2026-10-28T09:15:22Z",
  "is_team_note": true,
  "is_community_note": false
}
```

#### C. Calls Tab Table Synchronization
When a note is created:
1. It is posted to `POST /candidates/{candidate_id}/notes/`.
2. It immediately updates `callStateCache.updateCandidate(candidateId, { latest_manual_call_note: text })` and `sessionStorage ("nxthyre_last_call_completed")`.
3. The Calls tab table ([`CandidateList.tsx`](file:///src/pages/call/components/CandidateList.tsx)) displays this note in the **Notes** column without requiring a manual page refresh.

---

## 4. Call Ended Early Dialog (`CallEndedEarlyDialog.tsx`)

Automatically opens when a recruiter's call lasts **approximately 1 minute 10 seconds or less ($\le$ 70s / under 1m 20s)** or ends abruptly (busy, switched off, no pick up).

### 4.1 Trigger Workflow
1. When `handleEndCall()`, `handleEndManualCall()`, or remote hangup occurs:
   $$\text{Duration} = \text{Math.round}\left(\frac{\text{Date.now()} - \text{callStartedAt}}{1000}\right)$$
2. If $\text{Duration} \le 70\text{ seconds}$, `CallEndedEarlyDialog` opens automatically displaying the duration badge (`MM:SS`), candidate info, quick-select reasons, quick note pills, and a custom note field.

### 4.2 Endpoint Called
- **Frontend Function**: `saveCallLog(payload)`
- **Endpoint**: `POST /api/plivo/call-log/` (or `http://localhost:5173/api/plivo/call-log/`)
- **Method**: `POST`
- **Auth**: Bearer Token

#### Request Payload Example:
```json
{
  "call_uuid": "c57e461f-9b26-4571-92f9-3aeaf70c0320",
  "candidate_id": "c22044fa-bde0-4a18-b60a-d04f22911b00",
  "phone_number": "9835901230",
  "call_mode": "manual",
  "call_status": "busy",
  "reason": "Number Busy",
  "note": "Number Busy: this is the test call",
  "duration_seconds": 5,
  "tags": [
    "Placed somewhere",
    "Number Busy"
  ]
}
```

#### Backend Response Example (`200 OK` / `201 Created`):
```json
{
  "id": 913,
  "created_at": "2026-10-28T08:43:43.858315Z",
  "call_uuid": "c57e461f-9b26-4571-92f9-3aeaf70c0320",
  "candidate_id": "c22044fa-bde0-4a18-b60a-d04f22911b00",
  "caller_uid": "",
  "phone_number": "9835901230",
  "call_status": "busy",
  "call_type": "outgoing",
  "call_mode": "manual",
  "reason": "Number Busy",
  "note": "Number Busy: this is the test call",
  "duration_seconds": 5,
  "tags": [
    "Placed somewhere",
    "Number Busy"
  ],
  "checklist_data": null,
  "skills_data": null,
  "role_questions_data": null
}
```

### 4.3 Database Atomic Update Requirement
When `POST /api/plivo/call-log/` receives the log, the backend must atomically insert the `call_logs` entry **and update `job_applications`** so subsequent table fetches immediately reflect the outcome:

```sql
-- 1. Insert call log record
INSERT INTO call_logs (
    call_uuid, candidate_id, phone_number, call_status,
    call_mode, reason, note, duration_seconds, tags, created_at
) VALUES (
    'c57e461f-9b26-4571-92f9-3aeaf70c0320', 'c22044fa-bde0-4a18-b60a-d04f22911b00',
    '9835901230', 'busy', 'manual', 'Number Busy',
    'Number Busy: this is the test call', 5,
    '["Placed somewhere", "Number Busy"]'::jsonb, NOW()
);

-- 2. Atomically synchronize latest application status
UPDATE job_applications
SET latest_manual_call_status = 'busy',
    latest_manual_call_at = NOW(),
    latest_manual_call_note = 'Number Busy: this is the test call',
    last_active_at = NOW()
WHERE candidate_id = 'c22044fa-bde0-4a18-b60a-d04f22911b00';
```

### 4.4 Reason to `call_status` Mapping Table

| Reason Pill in Dialog | `call_status` Sent to Backend | Follow-up Queue Behavior |
| :--- | :--- | :--- |
| **`Didn't Pick up`** | `not_picked_up` | Keeps candidate in call queue for retry |
| **`Number Busy`** | `busy` | Marked for callback |
| **`Switched off`** | `switched_off` | Marked unreachable |
| **`Invalid Number`** | `wrong_number` | Marked for contact review |
| **`Not Interested`** (Pink Highlight) | `not_interested` | Marked not interested |
| **`Call me later`** | `follow_up` | Retained in follow-ups |
| **`Call me in 2days`** | `follow_up` | Scheduled follow-up |
| **`Will update later!`** Button | `follow_up` | Marked with `"Reason missing"` tag so nothing is lost |

---

## 5. Master Summary: Workspace Endpoints

| Component / Tab | Action | Endpoint | Method | Key Request Fields |
| :--- | :--- | :--- | :--- | :--- |
| **Tab 1: Profile** | Save Editable Details | `/candidates/{id}/editable-fields/` | `PATCH` | `notice_period_days`, `notice_status`, `last_working_day`, `current_salary`, `expected_ctc`, `location`, `reason_for_change` |
| **Tab 2: Skills** | Button Click Auto-Save | `/api/plivo/call-log/` | `POST` | `candidate_id`, `call_uuid`, `skills_data` (`{"React": "positive"}`) |
| **Tab 2: Skills** | Restore Feedback on Load | `/api/plivo/call-log/?candidate_id={id}` | `GET` | Query params: `candidate_id`, `limit=5` |
| **Tab 3: Notes** | Fetch Candidate Notes | `/candidates/{candidate_id}/notes/` | `GET` | `candidate_id` |
| **Tab 3: Notes** | Post Candidate Note | `/candidates/{candidate_id}/notes/` | `POST` | `teamNotes`, `is_community_note` |
| **Early Call Dialog** | Save Early Call Outcome | `/api/plivo/call-log/` | `POST` | `call_uuid`, `candidate_id`, `call_status`, `reason`, `note`, `duration_seconds`, `tags` |

---

## 6. Backend Implementation Checklist

- [ ] **`call_logs` Table**: Ensure `skills_data JSONB NULL`, `tags JSONB/ARRAY`, `reason VARCHAR`, and `note TEXT` columns exist.
- [ ] **`POST /api/plivo/call-log/`**: Ensure saving call logs atomically updates `job_applications.latest_manual_call_note`, `latest_manual_call_status`, and `latest_manual_call_at`.
- [ ] **`PATCH /candidates/{id}/editable-fields/`**: Persist `notice_status`, `last_working_day`, `open_to_relocate`, `relevant_experience`, and `reason_for_change`.
- [ ] **`GET /candidates/{id}/notes/` & `POST /candidates/{id}/notes/`**: Ensure candidate team notes persist and return `noteId`, `content`, `postedBy`, and `posted_at`.
