## Context

Users get "client is offline" error when importing via Firestore ID. The Firestore SDK needs proper initialization to handle network issues gracefully.

**Current state:**
- Firestore initialized without persistence settings
- No network status check before queries
- Error messages not helpful for debugging

## Goals / Non-Goals

**Goals:**
- Add Firestore persistence to enable offline caching
- Call enableNetwork() before queries to ensure connectivity
- Add network status check with user-friendly error messages

**Non-Goals:**
- Not implementing full offline mode (data still local)
- Not changing import flow - just fixing connection issues

## Decisions

### 1. Persistence approach
**Decision:** Use enableIndexedDbPersistence() for browser caching
**Rationale:** Firestore SDK feature specifically for browser offline support

### 2. Network check timing
**Decision:** Check network before each Firestore query
**Rationale:** More reliable than relying on SDK's internal state

### 3. Error handling
**Decision:** Check for specific error patterns and provide helpful messages
**Rationale:** "Client is offline" doesn't tell user what to do

## Risks / Trade-offs

- **[Risk] Persistence might slow initial load** → Mitigation: Only enable when needed, not on every page load

## Open Questions

None - requirements are clear from user error message