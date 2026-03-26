---
title: "What is Agent Ledger?"
description: "An open, vendor-neutral specification for verifiable, composable agent execution."
section: "concepts"
order: 1
next: { label: "The Stack", slug: "concepts/the-stack" }
---

## The Problem

AI agents are increasingly capable, but the infrastructure for trustworthy multi-agent work is missing. Today:

- Agents can't verify each other's work
- There's no standard way to compose agents from different vendors
- No standard audit trail exists for what agents did and why
- Human oversight is implemented differently by every tool

## The Solution

Agent Ledger introduces three file types that fill this gap:

1. **WORKFLOW.md** -- Composable execution plans
2. **LEDGER.md** -- Verifiable execution records
3. **TRUST.md** -- Capability declarations

All three follow the same design philosophy as Agent Skills: markdown format, Git-friendly, progressive disclosure, vendor-neutral.

## Design Philosophy

- **Markdown-first**: Human-readable, version-controllable, auditable
- **Git-friendly**: Standard diff, merge, and review workflows
- **Vendor-neutral**: Works with any compliant runtime
- **Progressive disclosure**: Load only what you need, when you need it
- **Proven patterns**: Every component maps to a battle-tested Unix concept
