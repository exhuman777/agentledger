---
title: "Gate Types"
description: "Complete reference for verification gates: auto-pass, human-approval, threshold, and skill-based."
section: "reference"
order: 14
prev: { label: "Schema", slug: "reference/schema" }
next: { label: "Hashing", slug: "reference/hashing" }
---

## Overview

Gates are the verification primitive in Agent Ledger. They determine what must happen before a workflow step's output is accepted and the next step can begin.

## auto-pass

```yaml
- gate: auto-pass
```

The simplest gate. Passes if the step completes without error. No human intervention required.

**Use for**: Automated checks (linting, testing, type checking), data transformations, non-destructive operations.

**Ledger recording**: `gate: auto-pass (passed)` or `gate: auto-pass (failed: error message)`

## human-approval

```yaml
- gate: human-approval
```

Pauses workflow execution and waits for explicit human approval. The runtime must present the step's output to a human and record their decision.

**Use for**: Deployments, external communications, destructive operations, anything hard to reverse.

**Ledger recording**: `gate: human-approval (approved by user@org, 2026-03-25T10:03:12Z)` or `gate: human-approval (rejected by user@org, 2026-03-25T10:03:12Z)`

## threshold(N)

```yaml
- gate: threshold(0.95)
```

Passes if the step returns a confidence score at or above the threshold. The score must be a float between 0.0 and 1.0.

**Use for**: Fact-checking, quality scoring, health checks, any step that produces a quantitative confidence measure.

**Ledger recording**: `gate: threshold(0.95) (passed, score: 0.97)` or `gate: threshold(0.95) (failed, score: 0.82)`

## skill(slug)

```yaml
- gate: skill(verify-output)
```

Delegates verification to another skill. The verification skill receives the step's output and returns a pass/fail decision.

**Use for**: Complex verification logic that can't be expressed as a simple threshold, domain-specific validation.

**Ledger recording**: `gate: skill(verify-output) (passed)` or `gate: skill(verify-output) (failed: reason)`

## Gate Precedence in TRUST.md

When both `WORKFLOW.md` and `TRUST.md` specify gates for the same step, the stricter gate wins:

1. `human-approval` overrides everything
2. `threshold(N)` overrides `auto-pass`
3. `skill(slug)` overrides `auto-pass`
4. `auto-pass` is the default and least strict
