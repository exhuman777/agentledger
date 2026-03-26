---
title: "Unix Analogy"
description: "Every component of Agent Ledger maps to a proven Unix concept. Nothing here is speculative."
section: "concepts"
order: 3
prev: { label: "The Stack", slug: "concepts/the-stack" }
next: { label: "WORKFLOW.md", slug: "spec/workflow" }
---

## The Mapping

| Unix Concept | Agent Equivalent | Layer |
|---|---|---|
| Commands (`ls`, `grep`, `awk`) | Agent Skills (`SKILL.md`) | Capabilities |
| Users, groups, `/etc/passwd` | Agent Companies (`COMPANY.md`, `TEAM.md`) | Organization |
| Pipes (`stdin`/`stdout`) | Agent-to-agent data handoff | **Ledger** |
| Process model (`fork`, `exec`, `wait`) | Standard execution lifecycle | **Ledger** |
| Permissions (`rwx`, capabilities) | Capability/authority model | **Ledger** |
| Shell (`bash`, `zsh`) | Workflow composition language | **Ledger** |
| `syslog` / audit trail | Execution verification log | **Ledger** |

## Why This Matters

Every component in Agent Ledger has a proven precedent:

| Ledger Component | Unix/Industry Precedent |
|---|---|
| Append-only execution log | Git commit history, database WAL logs |
| Content-addressable hashing | Git objects, IPFS, Docker image layers |
| Declarative workflow specs | GitHub Actions YAML, Terraform HCL, Kubernetes manifests |
| Capability-based security | Linux capabilities, iOS entitlements, Android permissions |
| Human-in-the-loop gates | CI/CD approval gates, code review requirements |

Nothing here requires new cryptography, consensus mechanisms, or runtime architectures. It's proven patterns assembled into a specification that fills a specific, urgent gap.

## The Conservative Argument

The most radical thing about Agent Ledger is that it's boring by design. Every piece has been battle-tested in other contexts for years or decades. The innovation is in recognizing that these same patterns apply to multi-agent systems, and that an open standard for them is the missing infrastructure.
