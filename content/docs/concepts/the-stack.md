---
title: "The Stack"
description: "How Agent Skills, Agent Companies, and Agent Ledger fit together as a unified infrastructure."
section: "concepts"
order: 2
prev: { label: "What is Agent Ledger?", slug: "concepts/what-is-agent-ledger" }
next: { label: "Unix Analogy", slug: "concepts/unix-analogy" }
---

## Three Layers

The agent infrastructure stack has three layers, each building on the one below:

### Layer 1: Capabilities (Agent Skills)

[Agent Skills](https://agentskills.io) defines what agents can do. A `SKILL.md` file packages instructions, scripts, and reference materials into a portable capability that any compatible runtime can use.

- **What it provides**: Atomic units of agent competence
- **File format**: `SKILL.md` with YAML frontmatter + markdown instructions
- **Adopted by**: 33+ tools including Claude Code, Cursor, VS Code, Gemini CLI, GitHub Copilot

### Layer 2: Organization (Agent Companies)

[Agent Companies](https://agentcompanies.io) defines how agents are structured. It extends Skills with organizational primitives: companies, teams, agents, projects, and tasks.

- **What it provides**: Portable organizational structure
- **File formats**: `COMPANY.md`, `TEAM.md`, `AGENTS.md`, `PROJECT.md`, `TASK.md`
- **Status**: Draft specification, actively evolving

### Layer 3: Execution + Trust (Agent Ledger)

Agent Ledger defines how agents do work together and how humans verify that work was done correctly. It introduces three new file types for composition, verification, and capability management.

- **What it provides**: Verifiable, composable execution
- **File formats**: `WORKFLOW.md`, `LEDGER.md`, `TRUST.md`
- **Status**: Draft specification

## How They Compose

Agents defined in **Companies** use **Skills** to perform work. That work is orchestrated via **Workflows**, recorded in **Ledgers**, and governed by **Trust** declarations.

Each layer is independent -- you can use Skills without Companies, or Workflows without the full stack. But together they form a complete infrastructure for trustworthy autonomous agents.
