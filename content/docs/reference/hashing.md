---
title: "Hashing"
description: "Content-addressable hashing specification for verifiable inputs and outputs."
section: "reference"
order: 15
prev: { label: "Gate Types", slug: "reference/gates" }
---

## Algorithm

Agent Ledger uses SHA-256 as the default hashing algorithm. All hashes are recorded as lowercase hexadecimal strings prefixed with `sha256:`.

```
sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## What Gets Hashed

### Inputs

The serialized input to a step. For steps with `input` references, this is the concatenation of all referenced outputs, serialized as UTF-8 text.

For the first step in a workflow (no explicit input), the input is the workflow's trigger context (e.g., the diff being reviewed, the query being researched). Runtimes define how trigger context is serialized.

### Outputs

The serialized output of a step. This is the complete output produced by the skill, serialized as UTF-8 text.

### Skill Content

The skill's `SKILL.md` file content is hashed and recorded alongside the version. This ensures that the exact instructions used are verifiable, not just the version label.

## Verification Procedure

To verify a ledger entry:

1. Obtain the input data (from the previous step's output or the trigger context)
2. Compute `sha256(input_data)` and compare to `input_hash`
3. Obtain the output data (from the step's recorded output)
4. Compute `sha256(output_data)` and compare to `output_hash`
5. Obtain the skill's `SKILL.md` at the recorded version
6. Compute `sha256(skill_content)` and compare to the hash in the skill reference

If all three match, the entry is verified. If any mismatch, the entry has been tampered with or the data has changed.

## Why Content Hashing

Content-addressable hashing enables trust without centralized authority:

- **No trust in labels**: Version "1.3" means nothing if the content can change. The hash pins the exact content.
- **No trust in agents**: An agent claiming it ran skill X is only credible if the output hash matches.
- **No trust in runtimes**: Any third party can verify the hash chain independently.
- **Tamper-evident**: Changing any byte in any input or output changes the hash, making tampering detectable.

This is the same principle that makes Git trustworthy: content-addressable storage where the address (hash) IS the verification.
