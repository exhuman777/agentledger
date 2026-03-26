---
title: "Adding Support"
description: "Guide for runtime implementors: how to add Agent Ledger support to your agent or tool."
section: "guides"
order: 8
prev: { label: "First Workflow", slug: "guides/first-workflow" }
next: { label: "Best Practices", slug: "guides/best-practices" }
---

## Overview

Adding Agent Ledger support to a runtime involves four capabilities: discovery, execution, ledger generation, and trust enforcement.

## 1. Discovery

Your runtime should look for Agent Ledger files in these locations:

- `WORKFLOW.md` in the project root or a `workflows/` directory
- `TRUST.md` in the project root or alongside the agent's `AGENTS.md`
- `LEDGER.md` files are generated, not discovered

Use the same progressive disclosure model as Agent Skills: load metadata (frontmatter) at startup, full content on activation.

## 2. Execution

When executing a workflow:

1. Parse the `WORKFLOW.md` frontmatter and step declarations
2. Resolve skill references via Agent Skills discovery
3. Resolve agent references via Agent Companies (if available) or use runtime defaults
4. Execute steps in declaration order, respecting `parallel` directives
5. For each step, evaluate the gate before proceeding
6. If a gate fails, execute the `rollback` skill if declared, then halt

## 3. Ledger Generation

After (and during) execution, generate a `LEDGER.md`:

1. Write frontmatter with workflow reference, run ID, start time, and initial status (`running`)
2. For each completed step, append a record with agent/skill versions, input/output hashes, timing, and gate result
3. Compute SHA-256 hashes of serialized inputs and outputs
4. On completion, update the status field to `completed`, `failed`, or `rolled-back`

## 4. Trust Enforcement

Before executing any step:

1. Find the `TRUST.md` for the agent being used
2. Check that every action the step attempts is within the declared capabilities
3. Check that no action falls within denied capabilities
4. For actions requiring gates, pause and request approval according to the gate type
5. Record the capability check result in the ledger

## Minimal Implementation

A minimal implementation need only support:

- Parsing `WORKFLOW.md` frontmatter and steps
- Sequential execution (no parallel support)
- `auto-pass` and `human-approval` gates
- Basic `LEDGER.md` generation with SHA-256 hashes

Parallel execution, `threshold` gates, `skill` gates, rollback, and trust enforcement can be added incrementally.
