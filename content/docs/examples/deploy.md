---
title: "Deploy Pipeline"
description: "Test, approve, and deploy with rollback and progressive trust."
section: "examples"
order: 12
prev: { label: "Research Pipeline", slug: "examples/research" }
next: { label: "Schema", slug: "reference/schema" }
---

## Overview

A deployment pipeline with parallel testing, staged approval, rollback handling, and progressive trust.

## WORKFLOW.md

```yaml
---
name: staged-deploy
description: Test, stage, approve, deploy to production.
schema: agentledger/v1
version: "2.0"
timeout: 2h
---

## Steps

### unit-test
- skill: test-runner
- gate: auto-pass
- parallel: [integration-test]

### integration-test
- skill: integration-tester
- gate: auto-pass
- parallel: [unit-test]

### stage
- skill: deploy-to-staging
- agent: ops/deployer
- input: ${unit-test.output}, ${integration-test.output}
- gate: auto-pass
- rollback: teardown-staging

### smoke-test
- skill: smoke-tester
- input: ${stage.output}
- gate: threshold(0.95)

### deploy-prod
- skill: deploy-to-production
- agent: ops/deployer
- input: ${smoke-test.output}
- gate: human-approval
- rollback: rollback-production
```

## TRUST.md with Progressive Trust

```yaml
---
name: deployer-trust
schema: agentledger/v1
---

## Agent: ops/deployer

### Requires
- filesystem: write (scope: /deploy/*, /var/log/deploys/*)
- network: outbound (hosts: [staging.acme.com, prod.acme.com, registry.acme.com])
- secrets: read (keys: [DEPLOY_TOKEN, REGISTRY_TOKEN])
- duration: max 600s

### Gates
- deploy-to-staging: auto-pass (after 3 successful runs)
- deploy-to-production: human-approval (always)
- rollback: auto-pass (always, rollbacks should never be gated)

### Denied
- network: outbound (hosts: [*.public-internet.com])
- spending: $0
```

## Key Patterns

**Progressive trust for staging**: After 3 successful staging deployments, the gate switches to auto-pass. Production always requires human approval.

**Ungated rollbacks**: Rollback skills run with `auto-pass` because you never want a failed rollback waiting for approval while production is down.

**Threshold gate on smoke tests**: A 0.95 confidence threshold on smoke tests means 95% of health checks must pass before production deployment is offered for approval.
