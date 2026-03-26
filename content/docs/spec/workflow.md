---
title: "WORKFLOW.md"
description: "Composable, declarative execution plans for multi-agent workflows."
section: "spec"
order: 4
prev: { label: "Unix Analogy", slug: "concepts/unix-analogy" }
next: { label: "LEDGER.md", slug: "spec/ledger" }
---

## Overview

A `WORKFLOW.md` file declares a multi-step execution plan that any compliant runtime can execute. Each step references an agent and a skill, specifies a verification gate, and can declare parallel execution or dependencies.

Workflows are declarative, not imperative. They describe WHAT should happen and in WHAT ORDER, not HOW the runtime should execute each step. This is what makes them portable.

## Frontmatter

| Field | Required | Description |
|---|---|---|
| `name` | **Yes** | Workflow identifier. Same naming rules as `SKILL.md` (lowercase, hyphens, 1-64 chars). |
| `description` | **Yes** | What this workflow does and when to use it. Max 1024 chars. |
| `schema` | No | Schema version, e.g. `agentledger/v1` |
| `version` | No | Workflow version string |
| `timeout` | No | Maximum total execution time (e.g. `30m`, `2h`) |

## Steps

Each step is declared as a Markdown H3 heading followed by a property list:

```yaml
### step-name
- skill: skill-slug
- agent: org/agent-slug
- gate: auto-pass
```

### Step Properties

| Property | Required | Description |
|---|---|---|
| `skill` | **Yes** | Skill slug reference. Resolves via Agent Skills discovery. |
| `agent` | No | Agent slug from `AGENTS.md`. Runtime assigns if omitted. |
| `gate` | No | Verification gate. Default: `auto-pass`. |
| `input` | No | References to outputs from previous steps via `${step.output}`. |
| `parallel` | No | Array of step names to execute concurrently with this step. |
| `rollback` | No | Skill slug to execute if this step fails. |
| `timeout` | No | Maximum execution time for this step. |

## Gate Types

Gates are the verification primitive. Every step can declare a gate that must pass before the workflow advances.

- **`auto-pass`** -- Passes if the step completes successfully. No human intervention.
- **`human-approval`** -- Pauses execution and waits for explicit human approval.
- **`threshold(N)`** -- Passes if the step's confidence score meets the minimum (0.0-1.0).
- **`skill(slug)`** -- Delegates verification to another skill.

## Input References

Steps can reference outputs from previous steps:

```yaml
### review
- skill: code-review
- input: ${lint.output}, ${test.output}
```

The `${step-name.output}` syntax resolves to the output of the named step. If the referenced step hasn't completed, the runtime waits.

## Parallel Execution

Steps can run concurrently:

```yaml
### lint
- skill: code-linting
- parallel: [test, typecheck]

### test
- skill: test-runner
- parallel: [lint, typecheck]

### typecheck
- skill: type-checker
- parallel: [lint, test]
```

All three steps execute simultaneously. Subsequent steps that reference their outputs wait for all parallel steps to complete.

## Rollback

Steps can declare a rollback skill:

```yaml
### deploy
- skill: deployment
- gate: human-approval
- rollback: revert-deploy
```

If the step fails (or a human rejects the gate), the runtime executes the rollback skill before marking the workflow as failed.

## Complete Example

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
