---
name: update-project-version
description: Update the project version number in the golf-web / golf-app project. ALWAYS ask the user (1) whether to update the backend, frontend, or both, and (2) the target version number, before making any changes. Frontend = package.json + navbar in navigation.component.html; backend = golf-app/build.gradle. Use when the user asks to bump, change, set, or update the project/app version, or to release a new version.
license: MIT
metadata:
  author: Grzegorz Malewicz
  version: "1.1"
---

# Update Project Version

Update the project version number consistently across the files that reference
it in this repository, scoped to the part(s) the user wants to change.

## When to Use

- User asks to "bump the version", "update the version", "set the version to X",
  "release version X", or similar.
- A new release requires the version to be incremented.

## Version Locations

The version string lives in **two areas** of the project:

### Frontend (golf-web)

| # | File | Reference | Format |
|---|------|-----------|--------|
| 1 | `package.json` | `"version"` field | `"version": "X.Y.Z"` |
| 2 | `src/app/navigation/navigation.component.html` | navbar brand link | `DGNG vX.Y.Z` |

### Backend (golf-app)

| # | File | Reference | Format |
|---|------|-----------|--------|
| 1 | `golf-app/build.gradle` | `version` assignment | `version = 'X.Y.Z'` |

## Procedure

### Step 1 — Ask which part to update (MANDATORY)

**Always** ask the user which part of the project to update **before** editing
anything. Use the `vscode_askQuestions` tool with fixed options:

> "Which part should I update the version for?"
> - **Backend** (`golf-app/build.gradle`)
> - **Frontend** (`package.json` + navbar)
> - **Both** _(recommended)_

Only the file(s) for the selected target(s) will be modified.

### Step 2 — Ask for the version number (MANDATORY)

**Always** ask the user for the target version number before editing anything.
Prompt such as:

> "What version number should I set? (current is `<CURRENT>`, e.g. `3.22.0`)"

- Read the current version first so you can show it to the user and validate the
  new value:
  - Frontend current version → `package.json` `"version"` field.
  - Backend current version → `golf-app/build.gradle` `version` assignment.
- **Note:** the backend and frontend versions are maintained independently and
  **can differ**. Read and report each target's own current version separately,
  and when updating **Both**, do not assume they start from the same value.
- Do **not** guess or auto-increment unless the user explicitly asks you to
  (e.g. "bump the patch version").
- Validate the response looks like a semantic version `X.Y.Z` (digits and dots).
  If it does not, ask again.

### Step 3 — Update the selected files

Apply the new version only to the files for the chosen target(s):

**If Frontend or Both:**

1. **`package.json`** — replace the value of the top-level `"version"` field:
   ```jsonc
   "version": "X.Y.Z",
   ```

2. **`src/app/navigation/navigation.component.html`** — replace the navbar
   brand text (keep the `DGNG v` prefix):
   ```html
   <a class="navbar-brand" href="#">DGNG vX.Y.Z</a>
   ```

**If Backend or Both:**

3. **`golf-app/build.gradle`** — replace the `version` assignment:
   ```gradle
   version = 'X.Y.Z'
   ```

### Step 4 — Verify

- Search the workspace for the **new** version string to confirm the expected
  files were updated:
  - Frontend only → expect 2 matches (`package.json`, navbar).
  - Backend only → expect 1 match (`build.gradle`).
  - Both → expect 3 matches.
- Report back which files were changed, the chosen target(s), and the
  old → new version transition.

## Notes

- The backend (`golf-app/build.gradle`) and frontend (`package.json`) versions
  can differ — they are versioned independently. Never assume they are in sync.
- If any targeted file no longer contains the expected version pattern, warn the
  user rather than editing blindly — the layout may have changed.
- If new version-bearing files are added to the project in the future, add them
  to the correct area in the **Version Locations** tables above.
