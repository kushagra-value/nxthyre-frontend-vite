# Frontend API Integration Guide

This document outlines the API changes made to support the new overall candidate question round performance column in the pipeline dashboard.

---

## 1. Summary of Changes

To support the new overall question round performance column, two new fields have been exposed at both the **Application** level and **Candidate Profile** level:
- **`question_analysis`**: Integer (0 to 100) representing the calculated average score of the candidate's screening questions, or `null` if not yet analyzed/answered.
- **`questioion_analysis`**: Duplicated field matching the spelling in frontend checks to ensure seamless integration.

### Calculation Method
The score is calculated on the backend using the **Average of Dimensions** (Option A):
$$\text{Average Score} = \frac{\text{ai\_accuracy\_score} + \text{ai\_clarity\_score} + \text{ai\_completeness\_score} + \text{ai\_depth\_score}}{4}$$
This averages the dimension scores across all evaluated screening questions for that candidate-job pair.

---

## 2. Updated API Endpoints and Payloads

### A. List Applications
* **Endpoint**: `GET /api/jobs/applications/?job_id={job_id}`
* **Response Payload**:
  Exposes the average score at both the root application level and inside the nested `candidate` object.

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "stage_slug": "shortlist",
      "status_tags": [
        {
          "text": "Moved today",
          "color": "green"
        }
      ],
      "question_analysis": 78,      // <-- Application level score
      "questioion_analysis": 78,     // <-- Spelling compatibility fallback
      "candidate": {
        "id": "cand_01",
        "full_name": "John Doe",
        "headline": "Senior Software Engineer",
        "profile_picture_url": "https://example.com/avatar.jpg",
        "question_analysis": 78,    // <-- Candidate level score
        "questioion_analysis": 78   // <-- Spelling compatibility fallback
      }
    }
  ]
}
```

---

### B. Candidate Sourcing Search
* **Endpoint**: `POST /api/candidates/search/`
* **Response Payload**:
  Exposes the average score inside the nested candidate objects under `results`.

```json
{
  "count": 42,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "cand_01",
      "full_name": "John Doe",
      "headline": "Senior Software Engineer",
      "profile_picture_url": "https://example.com/avatar.jpg",
      "question_analysis": 78,     // <-- Candidate level score
      "questioion_analysis": 78    // <-- Spelling compatibility fallback
    }
  ]
}
```

---

### C. Retrieve Candidate Profile
* **Endpoint**: `GET /api/candidates/{candidate_id}/?job_id={job_id}`
* **Response Payload**:
  Returns the score inside the candidate's detailed profile response.

```json
{
  "id": "cand_01",
  "full_name": "John Doe",
  "headline": "Senior Software Engineer",
  "profile_picture_url": "https://example.com/avatar.jpg",
  "question_analysis": 78,         // <-- Detailed profile score
  "questioion_analysis": 78        // <-- Spelling compatibility fallback
}
```

---

## 3. Integration Tips for Frontend

1. **Table Column Binding**: 
   For the pipeline table view, you can access the score directly from:
   `row.question_analysis` or `row.candidate.question_analysis`.
2. **Conditional Rendering**:
   If a candidate has not started the screening call, or the call is not yet analyzed by the AI pipeline, the value will be `null`. Render a placeholder like `-` or `N/A`.
3. **Color Coding**:
   For rendering the score badge, the following ranges can be used:
   - **Score >= 80**: Green (Strong Match)
   - **Score between 60 and 79**: Orange/Yellow (Moderate Match)
   - **Score < 60**: Red (Weak Match)