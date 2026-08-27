---
name: updateVersion
description: "Update the project version number (frontend, backend, or both). Use when you want to bump, change, set, or release a new version of golf-web / golf-app."
---

# Update Project Version

Use the `update-project-version` skill to update the project version number.

Follow the skill's procedure exactly:

1. Read the **current** frontend and backend versions and show them to the user.
   Remember they are versioned independently and **can differ**.
2. Ask the user **which part** to update — **Frontend**, **Backend**, or **Both**.
3. Ask the user for the **target version number** (`X.Y.Z`).
4. Update only the file(s) for the selected target(s):
   - **Frontend** → `package.json` + navbar in `src/app/navigation/navigation.component.html`
   - **Backend** → `golf-app/build.gradle`
5. Verify the changes and report the old → new version transition for each
   updated target.
