---
phase: 01
slug: tech-debt-refactoring-and-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Karma 6.4.x + Jasmine 6.1.x |
| **Config file** | `karma.conf.js` |
| **Quick run command** | `ng test --watch=false` |
| **Full suite command** | `ng test --watch=false && ng lint && ng build` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run `ng test --watch=false`
- **After every plan wave:** Run `ng test --watch=false` + `ng lint`
- **Before `/gsd-verify-work`:** Full suite must be green (0 lint errors, 388+ tests pass, build succeeds)
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | TD-INJECT | unit+lint | `ng test --watch=false && ng lint 2>&1 \| Select-String "prefer-inject" \| Measure-Object` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | TD-INJECT | unit | `ng test --watch=false` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 1 | TD-EQEQEQ | lint | `ng lint 2>&1 \| Select-String "eqeqeq" \| Measure-Object` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 1 | TD-CONTROLFLOW | lint | `ng lint 2>&1 \| Select-String "prefer-control-flow" \| Measure-Object` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 2 | TD-TYPES | lint | `ng lint 2>&1 \| Select-String "no-explicit-any" \| Measure-Object` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 2 | TD-MISC | lint | `ng lint 2>&1 \| Select-String "unused-vars\|prefer-const\|useless-assignment\|no-array-constructor\|component-selector" \| Measure-Object` | ✅ | ⬜ pending |
| 01-04-01 | 04 | 2 | TD-CLEANUP | unit+build | `ng test --watch=false && ng build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework or fixtures needed.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 35s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
