---
name: sonarcube-fix
description: "Scan SonarCloud for open issues and propose fixes. Use when: you want to review and fix code quality issues from SonarCloud."
---

# Fix SonarCloud Issues

Analyze the current SonarCloud issues for the golf-web project and propose specific, actionable fixes.

Please:
1. **Retrieve** all open issues from SonarCloud using the get-open-issues skill
2. **Categorize** issues by severity (Critical, Major, Minor) and type
3. **Analyze** each affected source file to understand the context
4. **Propose** concrete fixes with:
   - Clear before/after code examples
   - Step-by-step implementation guidance
   - File and line number references
   - Impact assessment for each fix
5. **Prioritize** fixes by severity and effort for optimal remediation

Focus on:
- Code smells and maintainability improvements
- Security vulnerabilities
- Bug fixes
- Performance optimizations

Respect the Angular best practices and coding standards defined in the project.
