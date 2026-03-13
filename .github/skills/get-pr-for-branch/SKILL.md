---
name: get-pr-for-branch
description: Get the PR number (pull request) associated with the current open Git branch, if a PR exists. Use when the user asks about the PR number for the current branch or wants to find what PR is linked to a branch.
license: MIT
compatibility: Requires GitHub CLI (gh) installed and authenticated, or a GITHUB_TOKEN environment variable.
metadata:
  author: Grzegorz Malewicz
  version: "1.0"
---

# Get PR Number for Current Branch

Retrieve the pull request number associated with the currently checked-out Git branch.

## When to Use

- User asks "what PR is associated with my current branch?"
- User needs the PR number to pass to another tool (e.g., SonarCloud issue scan for a PR)
- User wants to verify whether a PR exists for the current branch

## Prerequisites

**Option A — GitHub CLI (recommended)**  
Install and authenticate the GitHub CLI:  
```bash
gh auth login
```

**Option B — GitHub API with token**  
Set a personal access token with `repo` scope:  
```powershell
$env:GITHUB_TOKEN = "your-token"
```

---

## Commands

### Get PR number using GitHub CLI (simplest)

```powershell
# Returns the PR number for the current branch, or an error if none exists
gh pr view --json number --jq '.number'
```

To capture the value in a variable:

```powershell
$prNumber = gh pr view --json number --jq '.number'
if ($LASTEXITCODE -eq 0) {
    Write-Host "PR number: $prNumber"
} else {
    Write-Host "No open PR found for the current branch."
}
```

---

### Get PR number using GitHub API (no CLI required)

```powershell
# Step 1 – resolve owner, repo, and current branch
$branch   = git rev-parse --abbrev-ref HEAD
# Use the first remote regardless of its name (handles non-standard names like "gmalewicz/golf-web")
$remoteName = git remote | Select-Object -First 1
$remote   = git remote get-url $remoteName
# Extract owner/repo from HTTPS or SSH remote URL
if ($remote -match 'github\.com[:/](.+/.+?)(\.git)?$') {
    $ownerRepo = $Matches[1]
} else {
    Write-Error "Could not parse GitHub remote URL: $remote"
    exit 1
}

# Step 2 – query the GitHub API
$token    = $env:GITHUB_TOKEN
$headers  = @{ Authorization = "Bearer $token"; "User-Agent" = "PowerShell" }
$url      = "https://api.github.com/repos/$ownerRepo/pulls?state=open&head=$($ownerRepo.Split('/')[0]):$branch"

$response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get

# Step 3 – print result
if ($response.Count -gt 0) {
    $prNumber = $response[0].number
    Write-Host "PR number: $prNumber"
} else {
    Write-Host "No open PR found for branch '$branch'."
}
```

---

### Combined helper (CLI with API fallback)

```powershell
# Try GitHub CLI first; fall back to API if CLI is unavailable
$prNumber = $null

if (Get-Command gh -ErrorAction SilentlyContinue) {
    $prNumber = gh pr view --json number --jq '.number' 2>$null
    if ($LASTEXITCODE -ne 0) { $prNumber = $null }
}

if (-not $prNumber) {
    $branch      = git rev-parse --abbrev-ref HEAD
    $remoteName  = git remote | Select-Object -First 1
    $remote      = git remote get-url $remoteName
    if ($remote -match 'github\.com[:/](.+/.+?)(\.git)?$') {
        $ownerRepo = $Matches[1]
        $token     = $env:GITHUB_TOKEN
        $headers   = @{ Authorization = "Bearer $token"; "User-Agent" = "PowerShell" }
        $url       = "https://api.github.com/repos/$ownerRepo/pulls?state=open&head=$($ownerRepo.Split('/')[0]):$branch"
        $response  = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        if ($response.Count -gt 0) { $prNumber = $response[0].number }
    }
}

if ($prNumber) {
    Write-Host "PR number for current branch: $prNumber"
} else {
    Write-Host "No open PR found for the current branch."
}
```

---

## Notes

- Only **open** PRs are matched. Closed or merged PRs are not returned.
- If multiple open PRs target the same branch (rare edge case), the first result is used.
- The GitHub CLI approach (`gh pr view`) automatically uses the authenticated account and current repository context, making it the most reliable option.
