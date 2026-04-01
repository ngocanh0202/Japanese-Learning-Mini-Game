## Context

Currently the app can backup question sets to Firebase but has several issues:
- No way to view all question sets stored in Firebase
- Backup logic updates existing document if firestoreId exists - should always create new
- No delete functionality for Firebase documents
- COPY button is still present but should be removed

## Goals / Non-Goals

**Goals:**
- Show "☁️ FIREBASE SETS" button after Firebase config saved
- Display modal with list of all question sets in Firebase
- Each item has 3 actions: Copy URL, Import, Delete
- Backup always creates new document (never updates)
- Remove old COPY button from UI

**Non-Goals:**
- Not implementing real-time sync
- Not adding user authentication

## Decisions

### 1. Button visibility
**Decision:** Show Firebase Sets button only after config is saved and firebase is initialized
**Rationale:** Button should only be visible when user has configured Firebase

### 2. List display approach
**Decision:** Use modal overlay to show Firebase sets list
**Rationale:** Consistent with other modals in the app (import modal, etc.)

### 3. Import action
**Decision:** Import creates a NEW local question set (doesn't overwrite existing)
**Rationale:** User might want multiple copies of same set

## Risks / Trade-offs

- **[Risk] Large number of Firebase documents** → Mitigation: Add pagination if needed
- **[Risk] Delete by mistake** → Mitigation: Add confirmation dialog before delete

## Open Questions

None - requirements are clear from user specifications