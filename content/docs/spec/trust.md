---
title: "TRUST.md"
description: "Fine-grained capability declarations for agent authorization and permission enforcement."
section: "spec"
order: 6
prev: { label: "LEDGER.md", slug: "spec/ledger" }
next: { label: "First Workflow", slug: "guides/first-workflow" }
---

## Overview

A `TRUST.md` file declares what capabilities an agent requires and what it's explicitly denied. Runtimes read these declarations to enforce permissions. Humans review them to understand what an agent can do.

Think of it as Linux capabilities for agents: not root-or-nothing, but fine-grained, declarative, and auditable.

## Structure

```yaml
---
name: deploy-bot-trust
schema: agentledger/v1
---

## Agent: acme/deploy-bot

### Requires
- filesystem: write (scope: /deploy/*, /tmp/builds/*)
- network: outbound (hosts: [prod.acme.com, cdn.acme.com])
- spending: $0
- secrets: read (keys: [DEPLOY_TOKEN])
- duration: max 300s

### Gates
- destructive-actions: human-approval (always)
- first-run: human-approval (per-environment)
- routine: auto-pass (after 3 successful runs)

### Denied
- filesystem: write (scope: /etc/*, ~/.ssh/*)
- network: outbound (hosts: [*.social-media.com])
- code-execution: arbitrary
```

## Capability Types

| Capability | Scope Syntax | Description |
|---|---|---|
| `filesystem` | `read` or `write` with path globs | File system access |
| `network` | `outbound` or `inbound` with host lists | Network access |
| `spending` | Dollar amount (e.g. `$100`, `$0`) | Financial authority |
| `secrets` | `read` with key names | Secret/credential access |
| `duration` | `max Ns` or `max Nm` | Maximum execution time |
| `code-execution` | `sandboxed` or `arbitrary` | Code execution scope |

## Gate Overrides

Trust files can override default gate behavior per action type:

- **`always`** -- Gate required every time
- **`per-environment`** -- Gate required once per environment, then remembered
- **`after N successful runs`** -- Progressive trust. Gate required for first N runs, then auto-pass

## Deny Rules

Explicit denials take precedence over grants. If a capability is both required and denied, the denial wins. This allows organizations to set hard boundaries that individual agents cannot override.

## Runtime Enforcement

Compliant runtimes must:

1. Read `TRUST.md` before executing any workflow step involving the agent
2. Check that every action the agent attempts falls within declared capabilities
3. Block actions that fall outside declared capabilities or within denied capabilities
4. Record capability checks in the `LEDGER.md` gate results

## Least Privilege

Write `TRUST.md` declarations conservatively. Request only what the agent actually needs. Broad declarations (e.g. `filesystem: write (scope: /*)`) should trigger review warnings in compliant runtimes.
