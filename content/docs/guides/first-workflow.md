---
title: "First Workflow"
description: "Step-by-step tutorial: write your first WORKFLOW.md and understand how it executes."
section: "guides"
order: 7
prev: { label: "TRUST.md", slug: "spec/trust" }
next: { label: "Adding Support", slug: "guides/adding-support" }
---

## What You'll Build

A simple two-step workflow that lints code and then reviews it, with a human gate on the review step.

## Step 1: Create the File

Create a `WORKFLOW.md` file in your project root:

```yaml
---
name: simple-review
description: Lint code, then review with human approval.
schema: agentledger/v1
---

## Steps

### lint
- skill: code-linting
- gate: auto-pass

### review
- skill: code-review
- input: ${lint.output}
- gate: human-approval
```

## Step 2: Understand the Flow

When a compliant runtime executes this workflow:

1. It discovers the `WORKFLOW.md` file
2. It runs the `lint` step using the `code-linting` skill
3. If linting passes (`auto-pass` gate), it proceeds
4. It runs the `review` step, passing the lint output as input
5. It pauses and waits for human approval (`human-approval` gate)
6. Once approved, the workflow is marked as completed
7. A `LEDGER.md` is generated recording every step

## Step 3: Add Parallel Steps

Add a test step that runs alongside linting:

```yaml
### lint
- skill: code-linting
- gate: auto-pass
- parallel: [test]

### test
- skill: test-runner
- gate: auto-pass
- parallel: [lint]

### review
- skill: code-review
- input: ${lint.output}, ${test.output}
- gate: human-approval
```

Now `lint` and `test` execute simultaneously. The `review` step waits for both to complete.

## Step 4: Add Rollback

For workflows with irreversible steps, add rollback handling:

```yaml
### deploy
- skill: deployment
- input: ${review.output}
- gate: human-approval
- rollback: revert-deploy
```

If deployment fails (or the human rejects it), the runtime executes the `revert-deploy` skill automatically.

## Next Steps

- Read the full [WORKFLOW.md specification](/docs/spec/workflow) for all available options
- See [complete examples](/docs/examples/code-review) of real-world workflows
- Learn about [TRUST.md](/docs/spec/trust) to declare what your agents are allowed to do
