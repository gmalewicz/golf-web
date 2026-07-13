---
name: sonarcube-fix
description: "Scan SonarCloud for open issues and propose fixes. Use when: you want to review and fix code quality issues from SonarCloud."
---

# Fix SonarCloud Issues

First, ask the user which scope to fix:

> **Which issues do you want to fix?**
> - **Current PR** — only new/changed code in the active pull request
> - **Main branch** — all open issues on the main branch

Wait for the user's answer, then follow the corresponding path below:

---

## Path A — Current PR

1. Use the `get-pr-for-branch` skill to determine the current PR number (e.g. `770`)
2. Use the `get-open-issues` skill to fetch PR issues, passing `pullRequest=[PR_NUMBER]` to the API and saving the output to `sonar_issues_pr[PR_NUMBER].json` (e.g. `sonar_issues_pr770.json`) — do NOT overwrite `sonar_issues.json`
3. Invoke the `sonarcube_fix_agent` agent, instructing it to use `sonar_issues_pr[PR_NUMBER].json` as the source of issues

## Path B — Main branch

1. Use the `get-open-issues` skill to fetch all open issues, saving the output to `sonar_issues.json`
2. Invoke the `sonarcube_fix_agent` agent, instructing it to use `sonar_issues.json` as the source of issues

---

The agent will:
1. Load the Angular skill for framework-aware fixes
2. Retrieve all open issues from the selected file via the get-open-issues skill
3. Prioritize by severity (BLOCKER → CRITICAL → MAJOR → MINOR → INFO)
4. Dispatch a dedicated subagent per issue to apply the fix
5. Return a unified report of all fixed, skipped, and failed issues