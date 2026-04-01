## Context

The app currently has "IMPORT FROM ID" which only works with Firestore document IDs. Users want flexibility to import from any public JSON URL without requiring Firebase configuration. This design adds a toggle-based import system supporting both URL and ID modes.

**Current state:**
- Single import section with input for Firestore document ID
- COPY button copies firestoreId to clipboard
- No generic URL import capability

**Constraints:**
- URL mode should work without any Firebase config
- ID mode still requires Firebase (existing behavior)
- Must prompt for question set name before importing

## Goals / Non-Goals

**Goals:**
- Add toggle to switch between URL and ID import modes
- Default to URL mode for easier first-time use
- Generate Firestore REST API URL for sharing when in ID mode
- Prompt for question set name after successful data fetch
- Copy button adapts behavior based on toggle state

**Non-Goals:**
- Not implementing URL validation beyond basic format check
- Not adding URL history/favorites
- Not supporting authentication-protected URLs in URL mode

## Decisions

### 1. Toggle implementation approach
**Decision:** Use radio button group styled as toggle switch
**Rationale:** Clear visual indication of current mode, easy to tap, familiar UI pattern

### 2. URL vs ID detection
**Decision:** Detect input type based on prefix, not auto-detect
**Rationale:** 
- User explicitly selects mode via toggle
- Avoids confusion when input could be both
- Clearer UX - user knows what they're getting

### 3. Firestore URL format
**Decision:** Use Firestore REST API v1 format
**Format:** `https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/question-sets/{docId}`
**Rationale:** Full REST API URL that works directly in browser, matches user's requirement

### 4. Name prompt timing
**Decision:** Prompt AFTER successful fetch/validation, BEFORE creating question set
**Rationale:** 
- User confirms they want to import before being asked for name
- Name can be auto-suggested from source (URL path or Firestore document)
- Allows user to cancel without wasting fetch

## Risks / Trade-offs

- **[Risk] CORS issues with generic URLs** → Mitigation: URL mode may fail for some servers, but that's expected behavior - user can try different hosting
- **[Risk] Invalid JSON from URL** → Mitigation: Parse and validate before prompting for name
- **[Risk] User forgets to switch toggle** → Mitigation: Clear labels, default to URL (most common use case)

## Open Questions

None - all requirements are clear from user specifications.