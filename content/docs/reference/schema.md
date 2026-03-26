---
title: "Schema"
description: "Complete YAML schema definitions for WORKFLOW.md, LEDGER.md, and TRUST.md."
section: "reference"
order: 13
prev: { label: "Deploy Pipeline", slug: "examples/deploy" }
next: { label: "Gate Types", slug: "reference/gates" }
---

## WORKFLOW.md Schema

### Frontmatter

```yaml
name: string          # required, 1-64 chars, lowercase + hyphens
description: string   # required, 1-1024 chars
schema: string        # optional, e.g. "agentledger/v1"
version: string       # optional, semver recommended
timeout: string       # optional, duration (e.g. "30m", "2h")
```

### Step (H3 heading)

```yaml
- skill: string       # required, skill slug
- agent: string       # optional, agent slug (org/name)
- gate: string        # optional, default "auto-pass"
- input: string       # optional, ${step.output} references
- parallel: [string]  # optional, step names
- rollback: string    # optional, skill slug
- timeout: string     # optional, duration
```

## LEDGER.md Schema

### Frontmatter

```yaml
workflow: string      # required, workflow-name@version
run_id: string        # required, unique identifier
started: string       # required, ISO 8601 timestamp
completed: string     # optional, ISO 8601 timestamp
status: string        # required: running | completed | failed | rolled-back
```

### Step Record (H3 heading)

```yaml
- agent: string       # required, agent@version
- skill: string       # required, skill@version (sha256:hash)
- input_hash: string  # required, sha256:hex
- output_hash: string # required, sha256:hex
- started: string     # required, ISO 8601 timestamp
- duration: string    # required, e.g. "12s", "2m30s"
- gate: string        # required, gate-type (result)
```

## TRUST.md Schema

### Frontmatter

```yaml
name: string          # required, trust declaration identifier
schema: string        # optional, e.g. "agentledger/v1"
```

### Capability Declaration

```yaml
- type: scope (parameters)
```

Where `type` is one of: `filesystem`, `network`, `spending`, `secrets`, `duration`, `code-execution`.

### Gate Override

```yaml
- action-name: gate-type (condition)
```

Conditions: `always`, `per-environment`, `after N successful runs`.
