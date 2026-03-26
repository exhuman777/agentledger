// File templates for new Agent Ledger spec files

export function workflowTemplate(name) {
  return `---
name: ${name}
description: Multi-step agent workflow.
schema: agentledger/v1
version: "1.0"
---

## Steps

### step-one
- skill: example-skill
- agent: org/agent-name
- gate: auto-pass

### step-two
- skill: another-skill
- agent: org/reviewer
- gate: human-approval
- input: \${step-one.output}
`;
}

export function ledgerTemplate(name) {
  return `---
workflow: ${name}@1.0
run_id: ${crypto.randomUUID().slice(0, 8)}
started: ${new Date().toISOString()}
status: running
---

### step-one (completed)
- agent: org/agent-name@1.0
- skill: example-skill@1.0 (sha256:abc123)
- input_hash: sha256:def456
- output_hash: sha256:ghi789
- started: ${new Date().toISOString()}
- duration: 8s
- gate: auto-pass (passed)

### step-two (pending)
- agent: org/reviewer@2.0
- skill: another-skill@1.0 (sha256:jkl012)
- input_hash: sha256:mno345
- output_hash: sha256:pending
- started: pending
- duration: pending
- gate: human-approval (waiting)
`;
}

export function trustTemplate(name) {
  return `---
name: ${name}
schema: agentledger/v1
---

## Agent: org/agent-name

### Requires
- filesystem: write (scope: /output/*)
- network: outbound (hosts: [api.example.com])
- spending: $0
- duration: max 120s

### Gates
- destructive-actions: human-approval (always)
- routine: auto-pass (after 3 successful runs)

### Denied
- filesystem: write (scope: /etc/*, ~/.ssh/*)
- code-execution: arbitrary
`;
}
