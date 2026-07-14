# Sourcing Candidates by URL - API Specification

This document defines the REST API contract for triggering candidate sourcing via a specific URL with a custom categorization tag.

---

## 1. Trigger Sourcing by URL

Trigger the background scraping and extraction bot for a specific URL, labeling all sourced candidates with a custom tag.

- **Endpoint**: `/candidates/naukri-bot/source-by-url/`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (if applicable, otherwise standard session cookies used by the platform)

### Request Body Payload

```json
{
  "job_id": 45,
  "url": "https://www.naukri.com/job-listings-sde-2-google-hyderabad",
  "tag": "Google Sourcing"
}
```

### Request Parameter Details

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `job_id` | Integer | Yes | The Nxthyre Job ID to associate the sourced candidates with. |
| `url` | String | Yes | The sourcing target URL (e.g., Naukri job post, LinkedIn, or external portal). |
| `tag` | String | Yes | Custom tag / label to attach to all candidates extracted during this sourcing batch. |

---

### Expected Response

#### Success (202 Accepted / 200 OK)

Since candidate scraping and profile parsing is an asynchronous background task, the server should validate inputs and immediately queue the scraping job.

- **Status Code**: `202 Accepted` (or `200 OK`)
- **Body**:

```json
{
  "status": "success",
  "message": "Sourcing job has been queued successfully.",
  "task_id": "8a4f6d3a-129b-449e-ba0c-1c5c36d2ebef"
}
```

#### Error Responses

##### 400 Bad Request
Triggered if required parameters are missing, or the URL format is invalid.

```json
{
  "error": "Invalid URL format or missing parameter 'tag'."
}
```

##### 401 Unauthorized
Triggered if session credentials or token is missing or expired.

```json
{
  "detail": "Authentication credentials were not provided."
}
```

##### 500 Internal Server Error
Triggered if backend worker system fails to initialize the scraper task.

```json
{
  "error": "Failed to queue sourcing task. Please try again later."
}
```

---

## 2. Updated Candidate Data Model

When candidates are returned by the candidates list endpoint, the candidate object must include the tags under which they were sourced.

- **Endpoint**: `/candidates/naukri-bot/candidates/`
- **Method**: `GET`
- **Response Candidate Object Update**:
  Add an optional/nullable `search_tags` property to the `NaukbotCandidate` schema representing an array of tags.

### Example Candidate JSON Fragment:

```json
{
  "id": "e4587c69-23f4-4d8b-90f7-b67fcd5e2fbb",
  "name": "Jane Doe",
  "current_title": "Software Engineer II",
  "current_company": "Acme Corp",
  "ai_score": 85,
  ...
  "search_tags": ["Google Sourcing", "Referrals Q2"]
}
```
