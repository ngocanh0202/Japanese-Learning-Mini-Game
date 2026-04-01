## Context

The app recently added dual import (URL/ID modes) but has two bugs:
1. URL import fails when using Firestore REST API URL - response format is nested, not flat JSON
2. COPY button behavior depends on import toggle, should depend on question-set backup status

**Current state:**
- importFromGenericUrl() expects plain JSON array
- copyButtonHandler() checks importMode toggle
- Firestore REST returns: `{ "fields": { "questions": { "arrayValue": { "values": [...] } } } }`

## Goals / Non-Goals

**Goals:**
- Parse Firestore REST API response format correctly
- Always copy from active question-set backup, not import input

**Non-Goals:**
- Not changing import toggle behavior (keep URL/ID modes separate)
- Not adding new UI - just fixing existing bugs

## Decisions

### 1. Firestore format detection
**Decision:** Detect by checking for `fields.questions.arrayValue` structure
**Rationale:** Reliable indicator of Firestore REST format

### 2. COPY button behavior
**Decision:** Remove dependency on importMode, always check activeSet.firestoreId
**Rationale:** COPY is about sharing the question-set, not the import input

## Risks / Trade-offs

- **[Risk] Other REST APIs might have similar nested format** → Mitigation: Add detection, if parsing fails, fall back to plain array

## Open Questions

None - requirements are clear from user feedback