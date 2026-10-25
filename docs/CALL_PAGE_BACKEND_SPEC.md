# Call Page - Backend Implementation Specification

This specification defines the backend endpoints, data schemas, and query requirements needed to power the **Call Log / Call Queue** page (`/call`).

Reference Frontend Service: [`callService.ts`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/services/callService.ts)

---

## 1. Scope & Implementation Status

| Feature / API | Status | Backend Action Required |
| :--- | :--- | :--- |
| **Plivo Telephony / WebRTC Calling** | **Already Implemented** | No action required. Handled by existing telephony microservice (`/api/plivo/*`). |
| **Call Candidate Detail Page** (`/call/:jobId/:candidateId`) | **Already Implemented** | No action required. Reuses existing candidate profile and live copilot endpoints. |
| **Company & Job Selectors** | **Partially Implemented** | Verify active workspace and job posts return active data so fallbacks (`Deloitte`) are not triggered. |
| **Candidate Listing with Call Metadata & Filters** | **Action Required** | Implement/update `GET /jobs/applications/` to support filtering and return `screening_score`, `latest_manual_call_*` metadata. |
| **Call Queue Stats Cards** | **Action Required** | Implement `GET /api/calls/stats/` to power dynamic metrics on the 5 summary cards. |
| **Candidate In-Place Call Status Updates** | **Action Required** | Ensure `POST /api/plivo/call-log/` atomically updates latest call status on the candidate application record. |

---

## 2. Priority 1: Candidate Listing with Call Metadata & Filtering

This is the primary endpoint for the Call Page. Candidates are **only** fetched on demand after both a Company and a Job are selected.

- **Endpoint**: `GET /jobs/applications/` (or `/api/jobs/applications/`)
- **Method**: `GET`
- **Auth**: Bearer token / session cookie

### 2.1 Query Parameters Sent by Frontend

The frontend [`callService.getCandidates()`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/services/callService.ts#L95-L153) sends the following query parameters:

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `job_id` | integer | **Yes** | Nxthyre Job ID. Candidate query must filter by this ID. | `job_id=201` |
| `page` | integer | No | 1-indexed page number (Default: `1`). | `page=1` |
| `page_size` | integer | No | Page size (Frontend uses `page_size=8` or `20`). | `page_size=8` |
| `search` | string | No | Search query for candidate name, current company, or headline. | `search=Verstappen` |
| `location` | string | No | Comma-separated list of selected locations. | `location=Bengaluru,Mumbai` |
| `salary_min` | decimal | No | Minimum current salary in LPA. | `salary_min=12` |
| `salary_max` | decimal | No | Maximum current salary in LPA. | `salary_max=25` |
| `experience_min` | decimal | No | Minimum total experience in years. | `experience_min=2` |
| `experience_max` | decimal | No | Maximum total experience in years. | `experience_max=6` |
| `designation` | string | No | Comma-separated designations / job titles. | `designation=Frontend,React` |
| `notice_period` | string | No | Comma-separated notice period tags. | `notice_period=Immediate,15 Days` |
| `notice_period_min_days` | integer | No | Minimum notice period in days. | `notice_period_min_days=0` |
| `notice_period_max_days` | integer | No | Maximum notice period in days. | `notice_period_max_days=30` |
| `attention` | string | No | Attention categories. | `attention=Needs Attention` |
| `ordering` | string | No | Sort order (e.g. `-created_at`, `-score`). | `ordering=-score` |

---

### 2.2 Expected JSON Response Schema

Matches the TypeScript interface `CandidateCallItem`:

```json
{
  "count": 42,
  "next": "/api/jobs/applications/?job_id=201&page=2&page_size=8",
  "previous": null,
  "results": [
    {
      "id": 501,
      "candidate": {
        "id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
        "full_name": "Max Verstappen",
        "current_company": "Red Bull Racing",
        "headline": "Aero Engineer",
        "current_salary": "25.0",
        "current_salary_lpa": "25.0",
        "expected_ctc": "30.0",
        "notice_period_days": 30,
        "notice_period_summary": "30days",
        "location": "Bengaluru",
        "total_experience": 6,
        "experience_years": "6",
        "resume_url": "https://storage.googleapis.com/nxthyre-resumes/max_v.pdf"
      },
      "score": 85,
      "screening_score": 68,
      "latest_manual_call_status": "completed",
      "latest_manual_call_at": "2026-10-22T08:14:20Z",
      "latest_manual_call_note": "Call Back in 3 days",
      "last_active_at": "2026-10-22T08:14:20Z"
    }
  ]
}
```

### 2.3 Required Candidate Data Fields Explained

| Field | Type | Description | Frontend UI Usage |
| :--- | :--- | :--- | :--- |
| `id` | string / int | Application ID or Candidate ID. | Unique key for list rendering and profile routing. |
| `candidate.full_name` | string | Candidate full name. | Displayed in Candidate column title. |
| `candidate.current_company` | string | Current employer. | Subtitle: `{company} • {headline}`. |
| `candidate.headline` | string | Current role / headline. | Subtitle: `{company} • {headline}`. |
| `candidate.current_salary_lpa` | string / num | Current compensation in LPA. | CTC column (formatted e.g. `₹25L`). |
| `candidate.expected_ctc` | string / num | Expected compensation in LPA. | E-CTC column (formatted e.g. `₹30L`). |
| `candidate.notice_period_days`| int | Notice period in days. | NP column badge (`30days`). |
| `candidate.location` | string | City / location. | Location column (`Bengaluru`). |
| `candidate.total_experience` | num | Total years of experience. | Y.O.E column (`6`). |
| `score` | integer | **Resume Match Score (0–100)**. | **Score Column (1st Circle)**: Color ring (Green ≥ 80, Amber ≥ 60, Red < 60). |
| `screening_score` | integer / null | **Screening Round Score (0–100)**. | **Score Column (2nd Circle)**: Features `i` info badge. Tooltip displays: *"This is a screening score"*. Returns `--` if `null`. |
| `latest_manual_call_status` | string | e.g. `"completed"`, `"busy"`, `"no_answer"`. | Status pill / badge. |
| `latest_manual_call_at` | ISO string | Timestamp of the last completed call. | **Last Call column**: Formatted via `formatTimeAgo` (e.g. *"Just now"*, *"2 hours ago"*, *"3 days ago"*). |
| `latest_manual_call_note` | string | Text of the most recent note saved. | **Notes column**: Compact text pill showing call outcome. |
| `last_active_at` | ISO string | Last candidate activity timestamp. | Fallback if `latest_manual_call_at` is null. |

---

## 3. Priority 2: Call Queue Summary Stats Cards

Powers the 5 metric cards displayed at the top of the Call page layout:

- **Endpoint**: `GET /api/calls/stats/` (or `/api/call-queue/stats/`)
- **Method**: `GET`
- **Query Parameters**:
  - `workspace_id` *(optional, integer)*: Filter stats by company workspace.
  - `recruiter_uid` *(optional, string)*: Filter by recruiter (defaults to authenticated user).

### Expected Response `200 OK`
```json
{
  "totalCalls": 822,
  "totalCallsSubtext": "per month",
  "totalCallsToday": 13,
  "totalCallsTodaySubtext": "vs Target 125",
  "followUps": 822,
  "followUpsSubtext": "Total Calls today",
  "shortlisted": 822,
  "shortlistedSubtext": "Total Calls today",
  "avgTime": "5min",
  "avgTimeSubtext": "Avg Time Taken"
}
```

### Metrics Computation Logic:
1. **`totalCalls`**: Count of completed call logs for the current calendar month (`created_at >= date_trunc('month', NOW())`).
2. **`totalCallsToday`**: Count of calls logged since `00:00:00` today.
3. **`totalCallsTodaySubtext`**: Daily target comparison string, e.g. `"vs Target {daily_target}"`.
4. **`followUps`**: Count of candidates scheduled for follow-up today or marked with status `"follow_up"`.
5. **`shortlisted`**: Count of candidates moved to shortlisted stages today.
6. **`avgTime`**: Mean `duration_seconds` across calls logged today, formatted into minutes (e.g. `300s` $\rightarrow$ `"5min"`).

---

## 4. Priority 3: Candidate In-Place Call Status Sync

When a recruiter completes a call and saves notes on the Call page (`CandidateCallPage.tsx`), the frontend updates its client-side cache and calls:

- **Endpoint**: `POST /api/plivo/call-log/`
- **Method**: `POST`

### Request Payload
```json
{
  "call_uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "candidate_id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
  "call_mode": "manual",
  "call_status": "completed",
  "duration_seconds": 184,
  "note": "Candidate is strong in React & WebRTC. Ready for technical round.",
  "tags": ["Technical Strong", "Immediate Joiner"],
  "checklist_data": {
    "salary_fit": true,
    "location_fit": true
  }
}
```

### Required Backend Behavior:
1. Insert the record into `call_logs`.
2. **Synchronize Latest Call Data onto `job_applications`**:
   The backend must update the application record so subsequent fetches of the candidate list return the latest call status immediately:
   ```sql
   UPDATE job_applications
   SET latest_manual_call_status = 'completed',
       latest_manual_call_at = NOW(),
       latest_manual_call_note = 'Candidate is strong in React & WebRTC. Ready for technical round.',
       last_active_at = NOW()
   WHERE candidate_id = 'e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb';
   ```

---

## 5. Priority 4: Filter Auto-Complete Endpoints

Used by [`CallFiltersDialog.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/CallFiltersDialog.tsx) for dynamic search suggestions.

### 5.1 City / Location Suggestions
- **Endpoint**: `GET /api/candidates/city-suggestions/?query={query}`
- **Response**: Array of matching city strings.
```json
["Bengaluru", "Mumbai", "Hyderabad", "Delhi NCR", "Pune"]
```

### 5.2 Designation / Job Role Suggestions
- **Endpoint**: `GET /api/jobs/{job_id}/designations/?query={query}`
- **Response**: Array of designation strings matching the query for the given job.
```json
["Frontend Developer", "Senior Frontend Engineer", "UI Engineer"]
```

---

## 6. Priority 5: Company & Job Selectors Data

The frontend selectors in [`CallToolbar.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/CallToolbar.tsx) call:

1. `organizationService.getMyWorkspacesData()` $\rightarrow$ `GET /api/workspaces/my-workspaces/`
   - Must return at least: `[{ "id": 101, "name": "Company Name" }]`.
2. `jobPostService.getPaginatedRoles({ workspace_id })` $\rightarrow$ `GET /api/jobs/posts/?workspace_id={id}`
   - Must return at least: `[{ "id": 201, "title": "Job Title", "workspace_id": 101 }]`.

> [!NOTE]
> If these endpoints return empty arrays or fail, the frontend currently falls back to demo options (`Deloitte`, `Senior Front-End Developer +2`). Supplying real workspaces and jobs will automatically populate the live dropdowns.

---

## 7. Recommended Database Indexes

To maintain sub-100ms response times on `GET /jobs/applications/` with filters applied:

```sql
-- Fast filter by job & sorting by score
CREATE INDEX idx_job_app_job_scores 
ON job_applications(job_id, match_score DESC NULLS LAST, screening_score DESC NULLS LAST);

-- Fast sorting by last call activity
CREATE INDEX idx_job_app_last_call 
ON job_applications(job_id, latest_manual_call_at DESC NULLS LAST);

-- Trigram index for candidate name & title searching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_candidate_name_trgm ON candidates USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_candidate_company_trgm ON candidates USING gin (current_company gin_trgm_ops);
```
