## Context

The Japanese Learning Mini-Game currently stores all question sets in localStorage. Users cannot backup their data to the cloud or share question sets with others. This design adds Firebase Cloud Storage integration to enable these capabilities.

**Current state:**
- Question sets stored in localStorage (jq_question_sets)
- Import via JSON text paste in modal
- Export via JSON file download

**Constraints:**
- No authentication required (public Firebase Storage)
- Must work with vanilla JS (no build system)
- Firebase SDK loaded via CDN

## Goals / Non-Goals

**Goals:**
- Allow users to backup question sets to Firebase Storage with a public URL
- Allow users to share question sets via URL (copy link functionality)
- Allow users to import question sets from a Firebase Storage URL
- Provide UI for configuring Firebase credentials (Project ID, Storage Bucket)

**Non-Goals:**
- User authentication / login
- Sync all question sets automatically
- Real-time collaboration
- Privacy controls on question sets

## Decisions

### 1. Firebase Storage chosen over Realtime Database
**Rationale:** Cloud Storage provides direct public download URLs that are easy to share. Realtime Database would require custom URL routing logic. Cloud Storage also handles JSON files naturally.

### 2. Config stored in localStorage
**Rationale:** Users should only need to enter Firebase config once. Storing in localStorage persists across sessions without requiring authentication.

### 3. UI placed directly on screen-data
**Rationale:** Following user's request - import from URL input and Firebase config directly on screen-data, not hidden in modals. Backup/copy buttons next to question set controls.

### 4. Each question set stores its own Firebase URL
**Rationale:** Individual question sets can be backed up independently. The firebaseUrl field in question set object allows tracking which sets have been backed up.

## Risks / Trade-offs

- **[Risk] Firebase URL expiration** → Mitigation: Use getDownloadURL() which returns persistent URLs for publicly accessible files
- **[Risk] CORS issues when fetching from different domain** → Mitigation: Firebase Storage URLs allow cross-origin requests by default
- **[Risk] Invalid URL format** → Mitigation: Validate URL matches Firebase Storage pattern before attempting fetch
- **[Risk] Large JSON files** → Mitigation: No size limit enforced, but users should expect reasonable file sizes

## Open Questions

None - all requirements are clear from user specifications.