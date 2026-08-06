# Apply Suggestion (Auto-Fix CV)

## Overview

The **Apply Suggestion** feature allows users to click on analysis suggestions and automatically generate an improved CV that incorporates the fix. After clicking, users see a "Before vs After" preview and can download the improved CV as DOCX or PDF.

## User Flow

1. User uploads a CV and (optionally) a job description → clicks "Analyze"
2. Analysis results appear with **Actionable Steps** and **Master Profile Match** sections
3. Each suggestion now has a **⚡ Fix** button that appears on hover
4. User clicks "Fix" → loading spinner on that specific button
5. Backend calls Gemini to generate a new CV with the suggestion applied
6. A **preview modal** opens showing what changed
7. User can **Download DOCX** or **Download PDF** of the improved CV

## Architecture

```
Frontend                          Backend
────────                          ───────
AnalysisResults.jsx               POST /apply-suggestion
  └─ "⚡ Fix" button                ├─ Rate limit check (5/60s per IP)
  └─ calls handleApplySuggestion    ├─ Cache check (SHA-256 key)
       │                            ├─ Read Master Profile
       ▼                            ├─ Call apply_suggestion_to_cv()
App.jsx                             │   └─ Gemini API with targeted prompt
  └─ applySuggestion() API call     │
  └─ Opens SuggestionPreviewModal   ▼
       └─ Before/After diff       Return StructuredCV JSON
       └─ Download DOCX/PDF
```

## API Endpoint

### `POST /apply-suggestion`

**Request** (multipart/form-data):

| Field | Type | Required | Description |
|---|---|---|---|
| `suggestion` | string | ✅ | The suggestion text to apply |
| `job_description` | string | ❌ | Job description for context |
| `original_cv` | string (JSON) | ❌ | Current StructuredCV JSON for diff baseline |
| `language` | string | ❌ | Output language (default: "English") |

**Response**: `StructuredCV` JSON object

**Error Codes**:
- `400` — Master Profile not found / invalid JSON
- `429` — Rate limit exceeded (max 5 requests per 60 seconds)
- `500` — Gemini API failure

## Cost Protection Mechanisms

1. **In-memory cache**: Same suggestion + same Master Profile + same JD = cached result (no API call). Key is SHA-256 hash.
2. **Per-IP rate limiting**: Max 5 `/apply-suggestion` calls per 60-second window.
3. **Frontend debounce**: Fix button is disabled while any suggestion is being applied. Prevents accidental double-clicks.

## Files Changed

| File | Change |
|---|---|
| `backend/analyzer.py` | Added `apply_suggestion_to_cv()` function |
| `backend/main.py` | Added `/apply-suggestion` endpoint, cache, rate limiter |
| `frontend/src/services/api.js` | Added `applySuggestion()` API function |
| `frontend/src/components/AnalysisResults.jsx` | Added clickable "⚡ Fix" buttons |
| `frontend/src/components/SuggestionPreviewModal.jsx` | **New** — Before/After preview modal |
| `frontend/src/App.jsx` | Wired state management and modal rendering |

## Limitations (Current MVP)

- **No "Apply All"**: Only one suggestion at a time. Bulk apply is planned for phase 2.
- **No originalCV baseline**: In the analyze-only flow, there's no pre-existing `StructuredCV` to compare against, so the modal shows the generated CV as a preview rather than a true diff.
- **In-memory cache only**: Cache resets on server restart. Consider Redis for production.
