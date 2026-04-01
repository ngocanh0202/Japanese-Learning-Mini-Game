## Context

The current Firebase config UI only has 2 fields (projectId, storageBucket). The initializeFirebase() function uses hardcoded dummy values for other required Firebase config fields. This change adds all 7 standard Firebase config fields to the UI and updates the code to use them properly.

**Current state:**
- UI has only: Project ID, Storage Bucket
- localStorage key: jq_firebase_config
- initializeFirebase() uses dummy values for apiKey, authDomain, messagingSenderId, appId, measurementId

**Constraints:**
- Must maintain backward compatibility with existing saved configs (2 fields)
- All 7 fields should be optional (use defaults for empty values)
- Vanilla JS - no build system

## Goals / Non-Goals

**Goals:**
- Add 5 new input fields to Firebase config UI
- Save/load all 7 config fields properly
- Use actual config values in Firebase SDK initialization

**Non-Goals:**
- Not changing Firebase Storage functionality
- Not adding new features, just extending existing config

## Decisions

### 1. Backward compatibility approach
**Decision:** If existing config only has 2 fields, use empty strings for the missing fields.
**Rationale:** Ensures users who already saved their config won't break when they add more fields.

### 2. UI layout for 7 fields
**Decision:** Stack fields in pairs (2 columns on wider screens).
**Rationale:** Better use of horizontal space, matches existing UI patterns.

## Risks / Trade-offs

- **[Risk] Users may be confused by optional fields** → Mitigation: Add placeholder text explaining each field
- **[Risk] Old saved configs with only 2 fields** → Mitigation: loadFirebaseConfig() handles missing fields gracefully

## Open Questions

None - requirements are clear.