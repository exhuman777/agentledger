---
title: "Best Practices"
description: "Guidelines for writing effective workflows, trust declarations, and maintaining healthy ledgers."
section: "guides"
order: 9
prev: { label: "Adding Support", slug: "guides/adding-support" }
next: { label: "Code Review", slug: "examples/code-review" }
---

## Workflows

**Keep workflows small and focused.** A workflow should do one thing well. If a workflow has more than 7-8 steps, consider splitting it.

**Always use human-approval gates for destructive actions.** Deployments, data deletions, external communications -- anything hard to undo should require human sign-off.

**Version your workflows alongside your code.** `WORKFLOW.md` files belong in your repository, tracked by Git, reviewed in pull requests.

**Declare rollback for irreversible steps.** If a step can fail in a way that leaves the system in a bad state, provide a rollback skill.

**Use parallel execution for independent steps.** Linting and testing are independent -- run them simultaneously. Review depends on both -- run it after.

## Trust Declarations

**Start with least privilege.** Request only the capabilities your agent actually needs. You can always expand later.

**Be specific with scopes.** `filesystem: write (scope: /deploy/*)` is better than `filesystem: write (scope: /*)`.

**Use progressive trust for routine operations.** `after 3 successful runs` reduces friction while maintaining safety for new configurations.

**Deny explicitly.** If your agent should never access certain paths or hosts, declare it. Don't rely on runtimes to infer restrictions.

## Ledgers

**Never modify a ledger entry.** Append new records if a step is re-executed. The original record must remain.

**Store ledgers alongside your code.** Committed to Git, they form an auditable history of every agent action.

**Review ledgers in pull requests.** If a workflow produced changes, the ledger should be part of the review.
