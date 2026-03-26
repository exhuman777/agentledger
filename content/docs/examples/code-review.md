---
title: "Code Review"
description: "Complete multi-agent code review pipeline with lint, test, review, and deploy."
section: "examples"
order: 10
prev: { label: "Best Practices", slug: "guides/best-practices" }
next: { label: "Research Pipeline", slug: "examples/research" }
---

## Overview

A four-step pipeline: lint and test in parallel, human-reviewed code review, human-approved deployment with rollback.

## WORKFLOW.md

```yaml
---
name: code-review-and-deploy
description: Lint, test, review, and deploy with human gates.
schema: agentledger/v1
version: "1.0"
timeout: 1h
---

## Steps

### lint
- skill: code-linting
- agent: acme/reviewer
- gate: auto-pass
- parallel: [test]

### test
- skill: test-runner
- agent: acme/ci-bot
- gate: auto-pass
- parallel: [lint]

### review
- skill: code-review
- agent: acme/senior-reviewer
- input: ${lint.output}, ${test.output}
- gate: human-approval

### deploy
- skill: deployment
- agent: acme/deploy-bot
- input: ${review.output}
- gate: human-approval
- rollback: revert-deploy
```

## TRUST.md (for deploy-bot)

```yaml
---
name: deploy-bot-trust
schema: agentledger/v1
---

## Agent: acme/deploy-bot

### Requires
- filesystem: write (scope: /deploy/*)
- network: outbound (hosts: [prod.acme.com])
- secrets: read (keys: [DEPLOY_TOKEN])
- duration: max 300s

### Gates
- destructive-actions: human-approval (always)

### Denied
- filesystem: write (scope: /etc/*, ~/.ssh/*, /home/*)
- code-execution: arbitrary
```

## Example LEDGER.md Output

```yaml
---
workflow: code-review-and-deploy@1.0
run_id: a8f3e2d1
started: 2026-03-25T10:00:00Z
completed: 2026-03-25T10:05:30Z
status: completed
---

### lint (completed)
- agent: acme/reviewer@2.1
- skill: code-linting@1.3 (sha256:abc123)
- input_hash: sha256:def456
- output_hash: sha256:ghi789
- started: 2026-03-25T10:00:00Z
- duration: 12s
- gate: auto-pass (passed)

### test (completed)
- agent: acme/ci-bot@1.0
- skill: test-runner@2.0 (sha256:jkl012)
- input_hash: sha256:mno345
- output_hash: sha256:pqr678
- started: 2026-03-25T10:00:00Z
- duration: 94s
- gate: auto-pass (passed, 247/247 tests)

### review (completed)
- agent: acme/senior-reviewer@3.2
- skill: code-review@1.5 (sha256:stu901)
- input_hash: sha256:vwx234
- output_hash: sha256:yza567
- started: 2026-03-25T10:01:34Z
- duration: 38s
- gate: human-approval (approved by alice@acme, 2026-03-25T10:03:12Z)

### deploy (completed)
- agent: acme/deploy-bot@1.5
- skill: deployment@3.0 (sha256:bcd890)
- input_hash: sha256:efg123
- output_hash: sha256:hij456
- started: 2026-03-25T10:03:15Z
- duration: 135s
- gate: human-approval (approved by bob@acme, 2026-03-25T10:04:01Z)
```
