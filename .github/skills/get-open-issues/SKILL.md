---
name: get-open-issues
description: Interact with SonarCloud from the command line to create file with open issues for given project. Use when the user asks about project open issues.
license: MIT
compatibility: Requires SONARCLOUD_TOKEN environment variable.
metadata:
  author: Grzegorz Malewicz
  version: "1.0"
---

# Get Open Issues from SonarCloud

Interact with SonarCloud from the command line to create file with open issues for given project.

## When to Use

- User asks to provide list of open issues for given project

## Prerequisites

1. Set API token in an environmental variable: `$env:SONARCLOUD_TOKEN="your-token"` in powershell (requires setting each terminal session) 
or set in your system environment variables (preferred). If set in the system, restart IDE after setting env variable to ensure it's picked up.

## Issue Commands

### List Open Issues

```bash
# List open issues in given project
$token = $env:SONARCLOUD_TOKEN  
$url = "https://sonarcloud.io/api/issues/search?componentKeys=[PROJECT_KEY]&statuses=OPEN"  
  
$auth = [Convert]::ToBase64String(  
    [Text.Encoding]::ASCII.GetBytes("${token}:")  
)  
  
Invoke-WebRequest -Uri $url -Headers @{ Authorization = "Basic $auth" } -OutFile "sonar_issues.json"
```

```bash 
# List open issues for given pull request (PR)
$token = $env:SONARCLOUD_TOKEN  
$url = "https://sonarcloud.io/api/issues/search?componentKeys=[PROJECT_KEY]&pullRequest=[PR_NUMBER]&statuses=OPEN"  
  
$auth = [Convert]::ToBase64String(  
    [Text.Encoding]::ASCII.GetBytes("${token}:")  
)  
  
Invoke-WebRequest -Uri $url -Headers @{ Authorization = "Basic $auth" } -OutFile "sonar_issues.json"
```

