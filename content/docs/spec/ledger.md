---
title: "LEDGER.md"
description: "Append-only execution records with content-addressable hashing for verifiable agent work."
section: "spec"
order: 5
prev: { label: "WORKFLOW.md", slug: "spec/workflow" }
next: { label: "TRUST.md", slug: "spec/trust" }
---

## Overview

A `LEDGER.md` file is an append-only record of a workflow execution. Every step records what agent ran, what skill it used (with version), content hashes of inputs and outputs, timing, and gate results.

Ledgers are the trust primitive. If an agent says "I deployed your code," the ledger proves (or disproves) that claim with cryptographic hashes.

## Frontmatter

| Field | Required | Description |
|---|---|---|
| `workflow` | **Yes** | Reference to the workflow that was executed, with version (e.g. `code-review-and-deploy@1.0`) |
| `run_id` | **Yes** | Unique identifier for this execution run |
| `started` | **Yes** | ISO 8601 timestamp of when execution began |
| `completed` | No | ISO 8601 timestamp of when execution ended |
| `status` | **Yes** | Current status: `running`, `completed`, `failed`, `rolled-back` |

## Step Records

Each step in the workflow produces a record:

```yaml
### lint (completed)
- agent: acme/reviewer@2.1
- skill: code-linting@1.3 (sha256:abc123def456)
- input_hash: sha256:789ghi012jkl
- output_hash: sha256:345mno678pqr
- started: 2026-03-25T10:00:00Z
- duration: 12s
- gate: auto-pass (passed)
```

### Record Fields

| Field | Required | Description |
|---|---|---|
| `agent` | **Yes** | Agent identifier with version |
| `skill` | **Yes** | Skill identifier with version and content hash |
| `input_hash` | **Yes** | SHA-256 hash of serialized input |
| `output_hash` | **Yes** | SHA-256 hash of serialized output |
| `started` | **Yes** | ISO 8601 timestamp |
| `duration` | **Yes** | Execution duration |
| `gate` | **Yes** | Gate type and result. For `human-approval`: includes approver identity and timestamp. |

## Content-Addressable Hashing

Every input and output is hashed using SHA-256. This enables:

- **Verification**: Anyone can recompute the hash and confirm the data matches
- **Tamper detection**: Changing any input or output changes the hash
- **Reproducibility**: Same inputs to same skill version should produce same output hash
- **Audit trail**: The chain of hashes forms a verifiable execution trace

## Append-Only Semantics

Ledger files are append-only. Once a step record is written, it cannot be modified or deleted. This is enforced by convention (the spec prohibits mutation) and can be verified by tooling.

If a step needs to be re-executed, a new record is appended with a new timestamp. The original record remains.

## Status Values

| Status | Meaning |
|---|---|
| `running` | Workflow is currently executing |
| `completed` | All steps passed their gates successfully |
| `failed` | A step failed and no rollback was available (or rollback also failed) |
| `rolled-back` | A step failed but rollback executed successfully |

## Complete Example

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
