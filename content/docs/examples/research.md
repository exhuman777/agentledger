---
title: "Research Pipeline"
description: "Research, fact-check, draft, and publish workflow with threshold gates."
section: "examples"
order: 11
prev: { label: "Code Review", slug: "examples/code-review" }
next: { label: "Deploy Pipeline", slug: "examples/deploy" }
---

## Overview

A five-step research pipeline: gather sources, fact-check with a confidence threshold, draft, human review, and publish.

## WORKFLOW.md

```yaml
---
name: research-and-publish
description: Research a topic, verify facts, draft, review, publish.
schema: agentledger/v1
version: "1.0"
---

## Steps

### gather
- skill: web-research
- agent: research-team/gatherer
- gate: auto-pass

### verify
- skill: fact-checker
- agent: research-team/verifier
- input: ${gather.output}
- gate: threshold(0.85)

### draft
- skill: technical-writing
- agent: research-team/writer
- input: ${verify.output}
- gate: auto-pass

### review
- skill: editorial-review
- agent: research-team/editor
- input: ${draft.output}
- gate: human-approval

### publish
- skill: cms-publisher
- agent: research-team/publisher
- input: ${review.output}
- gate: human-approval
```

## Key Patterns

**Threshold gate on verify**: The fact-checker skill returns a confidence score. If it's below 0.85, the workflow halts -- the research isn't reliable enough to draft from.

**Sequential dependency**: Each step depends on the previous. No parallel execution here because each step transforms the previous output.

**Double human gate**: Both the editorial review and the publish step require human approval. The editor checks quality; the publisher checks timing and appropriateness.
