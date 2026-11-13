# Call Page, Tabs & Stats API – Backend Implementation Specification

This specification provides the backend developer with all required API endpoints, database schemas, calculation formulas, JSON payloads, and workflow rules needed to power the **NexThyre Recruiter Call Dashboard** (`/call`).

---

## 1. System Architecture & Tab Overview

The Call Dashboard contains a persistent header with **5 Statistics Cards**, a **Company/Job Toolbar with Kanban Board navigation**, and **3 Tabs**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Total Calls: 822]  [Calls Today: 13]  [Follow Ups: 23]  [Shortlisted: 12]  [Avg: 5min] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [Company Dropdown ▼]  [Job Dropdown ▼]  [Search...]  [Kanban ⊞]  [Upload]  [Filters ⚙]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Tabs:  [ Call ]   |   [ History ]   |   [ Shortlist ]                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Tab 1 (Call):      Active candidate call queue + Phone call + Shortlist (Sparkles)    │
│  Tab 2 (History):   Date-wise grouped call logs + Outcome pill + Shortlist/Notes/Del   │
│  Tab 3 (Shortlist): Shortlisted candidates + Matching Tags + Skills Fit hover breakdown│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Reference Frontend Service Files:
- Service single source of truth: [`src/services/callService.ts`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/services/callService.ts)
- Main Page Controller: [`src/pages/call/index.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/index.tsx)
- Call Queue Table: [`src/pages/call/components/CandidateList.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/CandidateList.tsx)
- Call History Table: [`src/pages/call/components/HistoryTab.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/HistoryTab.tsx)
- Shortlisted Table: [`src/pages/call/components/ShortlistTab.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/ShortlistTab.tsx)
- Skills Fit Hover Modal: [`src/pages/call/components/SkillsFitModal.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/SkillsFitModal.tsx)
- Header Stats Cards: [`src/pages/call/components/CallStats.tsx`](file:///c:/Users/rohit/OneDrive/Desktop/nxthyre-frontend-vite/src/pages/call/components/CallStats.tsx)

---

## 2. Priority 1: Call Queue Statistics API (`GET /calls/stats/`)

Powers the 5 metric cards at the top of the Call page. The frontend requests this endpoint whenever the user selects a company workspace, selects a job role, completes a call, or performs any stage action.

- **Primary Endpoint**: `GET /api/calls/stats/`
- **Fallback Endpoint**: `GET /api/call-queue/stats/`
- **Method**: `GET`
- **Auth**: Bearer Token / Session Authentication

### 2.1 Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `workspace_id` | integer | No | Filter stats by company workspace ID (used when no specific job is selected). |
| `job_id` | integer | No | Filter stats by specific job role ID (takes precedence; globally unique). |
| `recruiter_uid` | string | No | Filter by recruiter ID (defaults to authenticated `request.user`). |

> [!IMPORTANT]
> **Job vs Workspace Scope Note:**
> When `job_id` is passed, the stats must be queried by `job_id` directly (`job_id=job_id`). Do **not** query `Job.objects.get(id=job_id, workspace_id=workspace_id)` because `job_id` is globally unique, and strict multi-filtering will return `{"error": "Job not found."}` if there is any mismatch in the workspace parameter.

---

### 2.2 Expected JSON Response Schema

The backend may return either `camelCase` or `snake_case` (the frontend normalizes both):

```json
{
  "totalCalls": 822,
  "totalCallsSubtext": "Per month",
  "totalCallsToday": 13,
  "totalCallsTodaySubtext": "vs Target 45",
  "followUps": 23,
  "followUpsSubtext": "Calls pending",
  "shortlisted": 12,
  "shortlistedSubtext": "Candidates",
  "avgTime": "5min",
  "avgTimeSubtext": "Avg Time Taken"
}
```

*Alternative snake_case payload (also supported):*
```json
{
  "total_calls": 822,
  "total_calls_subtext": "Per month",
  "total_calls_today": 13,
  "total_calls_today_subtext": "vs Target 45",
  "follow_ups": 23,
  "follow_ups_subtext": "Calls pending",
  "shortlisted_count": 12,
  "shortlisted_subtext": "Candidates",
  "avg_duration_seconds": 300,
  "avg_time": "5min",
  "avg_time_subtext": "Avg Time Taken"
}
```

---

### 2.3 Django Metric Computation Logic

```python
from datetime import datetime, time
from django.utils import timezone
from django.db.models import Avg, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class CallStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workspace_id = request.query_params.get("workspace_id")
        job_id = request.query_params.get("job_id")
        user = request.user

        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_today = timezone.make_aware(datetime.combine(now.date(), time.min))

        # Base CallLog queryset
        call_logs = CallLog.objects.filter(recruiter=user)
        if workspace_id:
            call_logs = call_logs.filter(workspace_id=workspace_id)
        if job_id:
            call_logs = call_logs.filter(job_id=job_id)

        # 1. Total Calls (Month or Queue)
        total_calls = call_logs.filter(created_at__gte=start_of_month).count()
        total_calls_subtext = "In job queue" if job_id else "Per month"

        # 2. Total Calls Today
        calls_today = call_logs.filter(created_at__gte=start_of_today).count()
        daily_target = getattr(user.profile, "daily_call_target", 45) or 45

        # 3. Follow Ups
        # Count candidates scheduled for call back or marked with follow_up
        follow_ups = JobApplication.objects.filter(
            Q(latest_manual_call_status__in=["follow_up", "callback", "busy"]) |
            Q(call_attention__icontains="follow")
        )
        if job_id:
            follow_ups = follow_ups.filter(job_id=job_id)
        elif workspace_id:
            follow_ups = follow_ups.filter(job__workspace_id=workspace_id)
        follow_ups_count = follow_ups.count()

        # 4. Shortlisted Candidates
        shortlisted_qs = JobApplication.objects.filter(
            Q(current_stage__slug="shortlisted") | Q(current_stage__name__icontains="shortlist")
        )
        if job_id:
            shortlisted_qs = shortlisted_qs.filter(job_id=job_id)
        elif workspace_id:
            shortlisted_qs = shortlisted_qs.filter(job__workspace_id=workspace_id)
        shortlisted_count = shortlisted_qs.count()

        # 5. Avg Time Taken Today
        avg_seconds = call_logs.filter(
            created_at__gte=start_of_today,
            duration_seconds__gt=0
        ).aggregate(avg=Avg("duration_seconds"))["avg"] or 0
        avg_minutes = max(1, round(avg_seconds / 60)) if avg_seconds > 0 else 0

        return Response({
            "totalCalls": total_calls,
            "totalCallsSubtext": total_calls_subtext,
            "totalCallsToday": calls_today,
            "totalCallsTodaySubtext": f"vs Target {daily_target}",
            "followUps": follow_ups_count,
            "followUpsSubtext": "Calls pending",
            "shortlisted": shortlisted_count,
            "shortlistedSubtext": "Candidates",
            "avgTime": f"{avg_minutes}min",
            "avgTimeSubtext": "Avg Time Taken",
        })
```

---

## 3. Priority 2: Call History API (`GET /calls/history/`)

Powers the **History Tab**. Displays all previously contacted candidates grouped date-wise (e.g. *"Yesterday, Wed 28 Oct | 3 calls"*, *"Tue 27 Oct | 10 calls"*).

- **Endpoint**: `GET /api/calls/history/`
- **Method**: `GET`
- **Auth**: Bearer Token / Session Authentication

### 3.1 Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `job_id` | integer | **Yes** | Scopes history to the selected job role. |
| `page` | integer | No | 1-indexed page number (Default: `1`). |
| `page_size` | integer | No | Page size (Frontend uses `10`, `20`, or `50`). |
| `search` | string | No | Search candidate name, company, or headline. |

---

### 3.2 Expected JSON Response Schema

```json
{
  "count": 48,
  "next": "/api/calls/history/?job_id=201&page=2&page_size=10",
  "previous": null,
  "results": [
    {
      "id": "hist-101",
      "application_id": 501,
      "candidate_id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
      "candidate": {
        "id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
        "full_name": "Max Verstappen",
        "current_company": "Redbull Racing",
        "headline": "Race Engineer",
        "phone": "+919876543210",
        "location": "Bangalore",
        "current_salary_lpa": "12 LPA",
        "expected_ctc": "15 LPA",
        "notice_period_days": 30,
        "notice_period_summary": "30 days",
        "total_experience": 4,
        "score": 74,
        "screening_score": 80
      },
      "call_uuid": "call_abc12345",
      "call_time": "2026-10-28T11:20:00Z",
      "duration_seconds": 529,
      "call_status": "convinced",
      "status_display": "Convinced",
      "outcome": "Moved to shortlisted",
      "score": 74,
      "screening_score": 80,
      "is_archived": false,
      "archive_reason": null
    },
    {
      "id": "hist-102",
      "application_id": 502,
      "candidate_id": "c1947e82-12f3-4a1b-80a1-d748fba109ce",
      "candidate": {
        "id": "c1947e82-12f3-4a1b-80a1-d748fba109ce",
        "full_name": "Charles Leclerc",
        "current_company": "Scuderia Ferrari",
        "headline": "Aerodynamics Lead",
        "score": 74,
        "screening_score": null
      },
      "call_uuid": "call_def67890",
      "call_time": "2026-10-28T11:20:00Z",
      "duration_seconds": 45,
      "call_status": "not_picked_up",
      "status_display": "Didn't Pick",
      "outcome": "Follow up call today",
      "score": 74,
      "screening_score": null,
      "is_archived": false,
      "archive_reason": null
    },
    {
      "id": "hist-103",
      "application_id": 503,
      "candidate_id": "a9876f12-45e3-4c2d-91b2-e102fca334dd",
      "candidate": {
        "id": "a9876f12-45e3-4c2d-91b2-e102fca334dd",
        "full_name": "Lewis Hamilton",
        "current_company": "Mercedes AMG",
        "headline": "Senior Strategist",
        "score": 74,
        "screening_score": 80
      },
      "call_uuid": "call_ghi11223",
      "call_time": "2026-10-28T11:20:00Z",
      "duration_seconds": 38,
      "call_status": "reason_missing",
      "status_display": "Reason Missing",
      "outcome": "Add A Reason",
      "score": 74,
      "screening_score": 80,
      "is_archived": true,
      "archive_reason": "Archived by recruiter"
    }
  ]
}
```

---

### 3.3 Status Reasons & Outcome Formatting Rules

| Raw `call_status` | Formatted `status_display` | Badge Styling | Outcome Description |
| :--- | :--- | :--- | :--- |
| `convinced` | `Convinced` | Green badge (`#ECFDF5`, text `#065F46`) | Candidate convinced and moved to shortlisted. |
| `not_picked_up` / `no_answer` | `Didn't Pick` | Red/Pink badge (`#FEE2E2`, text `#991B1B`) | E.g. *"Follow up call today"*. |
| `reason_missing` | `Reason Missing` | Light orange/yellow badge | Recruiter prompted to add outcome reason. |
| `follow_up` / `callback` | `Call back Later` | Orange badge (`#FFEDD5`, text `#C2410C`) | E.g. *"Asked for JD, share it and call tmrw 11am"*. |
| `busy` | `Number Busy` | Amber badge | Busy signal encountered. |
| `switched_off` | `Switched off` | Gray badge | Phone switched off. |
| `wrong_number` | `Invalid Number` | Red badge | Incorrect contact info. |
| `not_interested` | `Not Interested` | Slate badge | Candidate declined opportunity. |

---

## 4. Priority 3: Early Call Outcome Logging (`CallEndedEarlyDialog`)

When a call duration is **$\le 70$ seconds** (or ends early), the frontend dialog automatically opens for the recruiter to submit:
1. **Status pill** (e.g. `Didn't Pick`, `Reason Missing`, `Call back Later`, `Number Busy`).
2. **Recruiter comment / note** (free-text input).

The backend is responsible for persisting this record and generating a concise, summarized outcome.

- **Endpoint**: `POST /api/calls/outcomes/` (or `PATCH /api/calls/{call_uuid}/outcome/`)
- **Method**: `POST` or `PATCH`
- **Auth**: Bearer Token

### 4.1 Request Payload Sent by Frontend

```json
{
  "call_uuid": "call_def67890",
  "candidate_id": "c1947e82-12f3-4a1b-80a1-d748fba109ce",
  "application_id": 502,
  "job_id": 201,
  "duration_seconds": 45,
  "reason": "Didn't Pick",
  "note": "Rang 4 times and went to voicemail. Candidate has notice period 30 days.",
  "call_time": "2026-10-30T05:40:00Z"
}
```

### 4.2 Backend Implementation Requirements
1. **Store Call Record**: Create or update the `CallLog` entry.
2. **Backend AI Summary Generation**: Generate a concise 1-sentence outcome from the reason and recruiter note (e.g. *"Follow up call today – voicemail left"*). **Frontend does not generate summaries.**
3. **Update Application Record**: Atomically sync `latest_manual_call_status`, `latest_manual_call_at`, `latest_manual_call_note`, and `latest_call_duration` on `JobApplication`.

---

## 5. Priority 4: Shortlisted Candidates API (`GET /jobs/applications/?stage_slug=shortlisted`)

Powers the **Shortlist Tab**. Displays candidates in the Shortlisted hiring stage with **Matching Tags** and **Skills Fit** evaluation.

- **Endpoint**: `GET /api/jobs/applications/`
- **Method**: `GET`
- **Auth**: Bearer Token

### 5.1 Query Parameters Sent by Frontend

```
GET /api/jobs/applications/?job_id=201&stage_slug=shortlisted&view=kanban&page=1&page_size=20&search=
```

---

### 5.2 Expected Candidate Response Object

```json
{
  "id": 501,
  "candidate": {
    "id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
    "full_name": "Max Verstappen",
    "current_company": "Redbull Racing",
    "headline": "Race Engineer",
    "location": "Bengaluru, India",
    "total_experience": 4,
    "experience_years": "4",
    "current_salary": "12.0",
    "current_salary_lpa": "12 LPA",
    "expected_ctc": "15 LPA",
    "notice_period_days": 30,
    "notice_period_summary": "NP CS",
    "score": 74,
    "screening_score": 80
  },
  "job_score": {
    "resume_score": 74,
    "screening_score": 80,
    "quick_fit_summary": [
      { "badge": "React.js", "status": "matched", "color": "green" },
      { "badge": "TypeScript", "status": "matched", "color": "green" },
      { "badge": "JavaScript (ES6+)", "status": "matched", "color": "green" },
      { "badge": "HTML5 / Modern CSS", "status": "matched", "color": "green" },
      { "badge": "Tailwind CSS", "status": "matched", "color": "green" },
      { "badge": "RESTful API Integration", "status": "matched", "color": "green" },
      { "badge": "Git & Version Control", "status": "matched", "color": "green" },
      { "badge": "Component Architecture", "status": "matched", "color": "green" },
      { "badge": "Secure Application Design", "status": "missing", "color": "yellow" },
      { "badge": "Solution Design Principles", "status": "missing", "color": "yellow" },
      { "badge": "Application & AI Solution Performance Optimization", "status": "missing", "color": "yellow" },
      { "badge": "US Healthcare Domain Knowledge", "status": "missing", "color": "yellow" }
    ]
  },
  "match_analysis": {
    "total": 25,
    "matched_count": 8,
    "matched_skills": [
      "React.js", "TypeScript", "JavaScript (ES6+)", "HTML5 / Modern CSS",
      "Tailwind CSS", "RESTful API Integration", "Git & Version Control", "Component Architecture"
    ],
    "missing_skills": [
      "Secure Application Design",
      "Solution Design Principles",
      "Application & AI Solution Performance Optimization",
      "US Healthcare Domain Knowledge"
    ]
  },
  "score": 74,
  "screening_score": 80,
  "latest_manual_call_at": "2026-10-27T10:00:00Z",
  "status": "ACTIVE",
  "is_archived": false
}
```

### 5.3 Matching Tags Resolution Rules
The frontend automatically extracts and renders up to 4 tags from backend fields:
1. **Experience**: `candidate.total_experience` $\rightarrow$ `"4years"`
2. **Current CTC**: `candidate.current_salary_lpa` $\rightarrow$ `"12 LPA"`
3. **Notice Period**: `candidate.notice_period_summary` $\rightarrow$ `"NP CS"` (Currently Serving) or `"NP 30days"`
4. **Location**: `candidate.location` $\rightarrow$ `"Bangalore"` or `"Bengaluru, India"`

### 5.4 Skills Fit Hover Breakdown Rules
- The table displays ratio: `08/25` (Green text `#009951`).
- Hovering over `08/25` triggers the portal modal:
  - **Matching Skills**: Badge pills in pastel green (`bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]`).
  - **Non-Matching Skills**: Badge pills in warm amber (`bg-[#FEFCE8] text-[#854D0E] border border-[#FDE047]`).
- **Data Contract**: The frontend strictly consumes skills fit data in either of these two canonical structures:
  1. **`job_score.quick_fit_summary`**: Array of `{ badge: string, status: "matched" | "missing" | "partial", color: "green" | "yellow" | "red" }`.
  2. **`match_analysis`**: Object with `{ total: number, matched_count: number, matched_skills: string[], missing_skills: string[] }`.
  *(Note: The frontend does not parse ad-hoc nested objects or unformatted skill lists. Return one of the two standard structures above).*

### 5.5 Nullable Call Timestamps
- `latest_manual_call_at`, `latest_call_at`, and `last_active_at` are nullable (`string | null`).
- When a candidate has not yet been called, return `null`. The frontend safely renders `"--"` or `"3days ago"`.

---

## 6. Priority 5: Candidate Pipeline Actions

The frontend executes the following actions via dedicated REST calls without full-page reloads:

### 6.1 Shortlist Candidate
- **Trigger**: Click `Sparkles` button in Call Tab or Shortlist action in History Tab.
- **Endpoint**: `PATCH /jobs/applications/{application_id}/`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "current_stage": 105,
    "status": "ACTIVE"
  }
  ```
  *(Where `105` is the stage ID with `slug: "shortlisted"` for the job).*
- **Expected Response**: `200 OK` with updated application object.

---

### 6.2 Archive Candidate
- **Trigger**: Click Archive icon in History or Shortlist Tab.
- **Endpoint**: `PATCH /jobs/applications/{application_id}/?view=kanban`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "current_stage": 109,
    "status": "ARCHIVED",
    "archive_reason": "Archived by recruiter",
    "feedback": {
      "subject": "Moved to Archive",
      "comment": "Archived by recruiter"
    }
  }
  ```
- **UI Behavior**: Displays candidate row with **50% opacity**, switches Archive icon to **Restore**, and shows a red **Delete** trash icon beside candidate name.

---

### 6.3 Restore Candidate
- **Trigger**: Click Restore icon on an archived candidate row.
- **Endpoint**: `PATCH /jobs/applications/{application_id}/`
- **Method**: `PATCH`
- **Payload**:
  ```json
  {
    "current_stage": 105,
    "status": "ACTIVE"
  }
  ```
- **UI Behavior**: Returns row to 100% opacity and restores candidate to active pipeline stage.

---

### 6.4 Permanent Delete
- **Trigger**: Click Delete icon on an archived candidate.
- **Endpoint**: `DELETE /jobs/applications/{application_id}/` (with fallback to `DELETE /candidates/{candidate_id}/`)
- **Method**: `DELETE`
- **Security Rule**: **Never use archive endpoint for permanent deletion.** Frontend presents a confirmation modal before triggering this hard delete endpoint.
- **Expected Response**: `204 No Content` or `200 OK`.

---

## 7. Priority 6: Candidate Notes API (`/candidates/{id}/notes/`)

Powers the chat-style **Notes Popover** accessible from candidate rows in Call, History, and Shortlist views. Notes remain synchronized across the dashboard and candidate profile.

### 7.1 Fetch Notes
- **Endpoint**: `GET /api/candidates/{candidate_id}/notes/`
- **Method**: `GET`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "content": "Candidate requested call back tomorrow at 11 AM.",
      "postedBy": "Jane Doe",
      "posted_at": "2026-10-30T05:30:00Z",
      "role": "Lead Recruiter"
    }
  ]
  ```

### 7.2 Post New Note
- **Endpoint**: `POST /api/candidates/{candidate_id}/notes/`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "teamNotes": "Candidate confirmed availability for technical interview on Friday.",
    "is_community_note": false
  }
  ```
- **Response `201 Created`**: Returns newly created note object.

---

## 8. Database Models & Schema Blueprint

To support all Call page features efficiently, ensure the following fields exist in your PostgreSQL schema:

```python
# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CallLog(models.Model):
    call_uuid = models.CharField(max_length=128, unique=True, db_index=True)
    recruiter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="call_logs")
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE, null=True, blank=True)
    job = models.ForeignKey("jobs.JobPost", on_delete=models.CASCADE, null=True, blank=True, db_index=True)
    application = models.ForeignKey("jobs.JobApplication", on_delete=models.CASCADE, null=True, blank=True, related_name="call_logs")
    candidate = models.ForeignKey("candidates.Candidate", on_delete=models.CASCADE, related_name="call_logs")

    duration_seconds = models.PositiveIntegerField(default=0)
    call_status = models.CharField(max_length=64, default="completed", db_index=True)
    # e.g. "convinced", "not_picked_up", "follow_up", "busy", "switched_off", "wrong_number", "not_interested", "reason_missing"
    status_display = models.CharField(max_length=128, null=True, blank=True)
    outcome = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["job", "-created_at"]),
            models.Index(fields=["recruiter", "-created_at"]),
        ]


class JobApplication(models.Model):
    # Existing stage and status fields
    candidate = models.ForeignKey("candidates.Candidate", on_delete=models.CASCADE)
    job = models.ForeignKey("jobs.JobPost", on_delete=models.CASCADE)
    current_stage = models.ForeignKey("jobs.Stage", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=32, default="ACTIVE", db_index=True)  # ACTIVE, ARCHIVED, HIRED
    archive_reason = models.TextField(null=True, blank=True)

    # Screening Scores
    match_score = models.FloatField(null=True, blank=True)       # Resume Score (0-100)
    screening_score = models.FloatField(null=True, blank=True)   # Screening Round Score (0-100)

    # Latest Call Sync Cache Fields (Updated by CallLog signals or outcome endpoint)
    latest_manual_call_at = models.DateTimeField(null=True, blank=True, db_index=True)
    latest_manual_call_status = models.CharField(max_length=64, null=True, blank=True)
    latest_manual_call_note = models.TextField(null=True, blank=True)
    latest_call_duration = models.PositiveIntegerField(null=True, blank=True)
    last_active_at = models.DateTimeField(auto_now=True)
```

---

## 9. Verification & Testing Checklist for Backend Partner

- [ ] **Stats API (`GET /api/calls/stats/`)**:
  - [ ] Returns valid counts when `workspace_id` is supplied.
  - [ ] Scopes metrics properly when `job_id` is supplied.
  - [ ] Computes `avgTime` in minutes based on today's calls.
- [ ] **History API (`GET /api/calls/history/`)**:
  - [ ] Returns actual ISO call timestamps (not hardcoded dates).
  - [ ] Returns correct duration, `call_status`, `status_display`, and summarized `outcome`.
  - [ ] Supports pagination (`page`, `page_size`) and search.
- [ ] **Early Call Outcome (`POST /api/calls/outcomes/`)**:
  - [ ] Stores duration, reason pill, and free-text recruiter note.
  - [ ] Persists summarized outcome and updates `JobApplication` latest call cache.
- [ ] **Shortlist Tab (`GET /api/jobs/applications/?stage_slug=shortlisted`)**:
  - [ ] Returns candidates belonging to the Shortlisted stage.
  - [ ] Includes experience, CTC, notice period, and location for Matching Tags.
  - [ ] Includes `job_score.quick_fit_summary` or `match_analysis` with matched and missing skills.
- [ ] **Stage Actions (`PATCH /jobs/applications/{id}/`)**:
  - [ ] Moves candidate to shortlisted stage with status `ACTIVE`.
  - [ ] Archives candidate with status `ARCHIVED` and preserves previous application state.
  - [ ] Restores archived candidate back to `ACTIVE` stage.
- [ ] **Notes (`/candidates/{id}/notes/`)**:
  - [ ] Fetches candidate notes chronologically.
  - [ ] Appends new notes and attributes author (`postedBy`).
