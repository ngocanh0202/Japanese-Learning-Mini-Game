## Context

Currently using Firebase Storage for backup/sharing but encountering CORS issues that require complex server-side configuration. Switching to Firestore eliminates CORS problems since Firestore SDK handles all HTTP requests natively.

**Current state:**
- Firebase Storage with CORS errors
- Functions: backupQuestionSet(), copyFirebaseUrl(), importFromUrl()
- UI: backup button, copy URL button, import from URL input

## Goals / Non-Goals

**Goals:**
- Replace Firebase Storage with Firestore for backup/sharing
- Maintain same user experience (backup, copy link, import)
- Use document ID as shareable identifier instead of URL
- No CORS configuration required

**Non-Goals:**
- Not adding real-time sync features
- Not implementing offline support
- Not changing localStorage behavior

## Decisions

### 1. Share mechanism: Document ID vs URL
**Decision:** Use Firestore document ID as shareable identifier
**Rationale:** 
- No URL generation needed
- Simpler for users to copy/paste
- Firestore document ID is unique and deterministic

### 2. Firestore data structure
**Decision:** Single collection "question-sets" with documents
**Rationale:** Simple hierarchy matching the app's question sets concept

### 3. Import by document ID
**Decision:** Query Firestore collection by document ID
**Rationale:** Direct document access by ID is simple and efficient

## Risks / Trade-offs

- **[Risk] Firestore requires network** → Mitigation: App works offline with localStorage, Firestore is only for backup/share
- **[Risk] Document ID might be confusing** → Mitigation: Provide clear UI labels explaining it's a "Share ID"

## Migration Plan

1. Add Firestore SDK to index.html
2. Update firebase-config.js with Firestore init
3. Rewrite backup/import functions
4. Update UI labels
5. Test end-to-end flow