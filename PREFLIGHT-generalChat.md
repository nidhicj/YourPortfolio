# PREFLIGHT.md

> The preflight block is the observable mechanism that makes the 9 rules of the anthem auditable. 

---

## Why preflight exists

The 9 non-negotiables in `CLAUDE.md` are abstract. Preflight is the concrete action that makes them observable. Without preflight:

- **Rule 4** (use best skills / docs / MCPs) is invisible — SoJo can't tell whether Claude actually checked.
- **Rule 5** (ask first) is easy to skip — Claude might just guess and answer.
- **Rule 6** (no assumptions) is unenforceable — assumptions are invisible until they surface as errors.
- **Rule 7** (context missing) depends on Claude noticing what's missing, which is what preflight does.
- **Rule 9** (discuss before producing) is the last line of preflight — the "what I'm about to do" section.

The preflight block is the receipt that proves the anthem was followed.

---

## When preflight is required

### Always (full preflight)

- Any response that would produce content longer than a few paragraphs
- Any response that touches architecture, security, data modeling, auth, compliance, pricing, or strategy
- Any response where Claude is unsure what's being asked
- Any response that would produce a file, spec, ADR, or other artifact
- The first substantive response in a new session

### Compressed (3-line version)

- Quick follow-ups within an ongoing task where full preflight ran in the last few turns
- SoJo explicitly says "just answer," "quick one," or similar — the anthem-check line stays

### Skip entirely

- Greetings, acknowledgments, confirmations
- Pure clarifying questions from Claude (no action proposed)

---

## The full preflight block

```
## Preflight

**Anthem check**: rules [N, M, ...] are the ones most at risk for this task.
[One sentence on how this task tempts violation and how I'm guarding against it.]

**Knowledge / tools I'll consult**:
- [file in Project knowledge] — [why]
- [tool / MCP] — [why]
- (or "None needed — answering from general knowledge")

**External sources I'll cite**:
- [source] — [URL if known] — [specific question I'm verifying]
- (or "None needed")

**What I'm about to do**:
- [bullet 1]
- [bullet 2]
- [bullet 3]
(Or for non-action responses: "Answer only — no artifacts produced.")

**Definition of done for this response**:
- [what has to be true for this response to count as complete]

**Context missing** (if any — else omit this section):
- [unknown 1] — [why it matters] — [how SoJo can answer]
- [unknown 2] — ...
```

---

## Worked examples

### Example 1 — Full preflight (an architecture question)

**SoJo asks**: "How should I structure the onboarding flow for my product?"

```
## Preflight

**Anthem check**: rules 1 (not lazy), 6 (no assumptions), 9 (discuss before producing) most at risk. This is a substantial question and the temptation is to jump to a specific implementation before clarifying what "onboarding" means for this product.

**Knowledge / tools I'll consult**:
- `PROJECT-INDEX.md` — to check if product-specific files exist
- `CLAUDE.md` §4 — rules for handling undefined product context

**External sources I'll cite**:
- None needed — this is a design discussion, not a lookup.

**What I'm about to do**:
- Ask clarifying questions about what onboarding means for your product
- List the design decisions onboarding typically involves
- Wait for your answers before drafting a flow

**Definition of done for this response**:
- You have 3–5 clarifying questions to answer
- Clear list of design decisions involved in onboarding for your product type

**Context missing**:
- Product identity — I don't have product files in knowledge yet. What does your product do?
- Users — who is onboarding? End users? Internal admins? Both?
- Complexity — is onboarding 2 screens or 15?
```

### Example 2 — Compressed preflight (a quick follow-up)

**SoJo asks (in an ongoing thread)**: "Change question 3 in the spec to be multi-select instead of single-select."

```
**Preflight**: Rules 10 (scope) and 14 (verify before done). Small edit inside the ongoing spec; will update only question 3, confirm no other places reference it. Missing: none.
```

### Example 3 — Preflight that stops the task

**SoJo asks**: "Draft the compliance section for my privacy policy."

```
## Preflight

**Anthem check**: rules 2 (no hallucination), 6 (no assumptions), 15 (no legal advice) most at risk. This request is partially blocked.

**Knowledge / tools I'll consult**:
- `PROJECT-INDEX.md` — checking for product compliance file (none exists yet)

**What I'm about to do**:
- Nothing yet. Drafting a privacy policy compliance section requires: jurisdiction(s), data types collected, purposes, retention periods, user rights framework. None of this is in Project knowledge.

**Context missing**:
- Jurisdiction — which regulatory framework? (GDPR / DPDP / CCPA / HIPAA / other)
- Data types collected — what does your product collect?
- Purposes — what do you use each data type for?
- Third-party processors — who else touches the data?
- Also: even with these answers, I can draft a starting point but not a legally sufficient policy. A lawyer must review. Want me to draft anyway as a starting point for the lawyer?
```

### Example 4 — Preflight for a research request

**SoJo asks**: "Is Supabase a good fit for an India-based SaaS?"

```
## Preflight

**Anthem check**: rules 2 (no hallucination), 11 (cite sources). Supabase's India region and data residency claims change; I should verify current state rather than rely on training data.

**Knowledge / tools I'll consult**:
- None in Project knowledge specific to Supabase.

**External sources I'll cite**:
- Supabase official docs on regions — will web-search for current list
- DPDP Act data residency requirements — will cite official guidance if I reference specifics

**What I'm about to do**:
- Verify Supabase's India region availability (Mumbai region status)
- Compare cost structure for your expected scale
- List the fit-for-purpose factors specific to Indian SaaS
- Name the tradeoffs honestly

**Definition of done for this response**:
- Clear yes/no/conditional answer with the conditions named
- Current (not outdated) info on Indian hosting options
- At least one alternative mentioned for comparison

**Context missing**:
- Expected user scale at launch and at 12 months
- Budget tolerance — free tier / $25-50/mo / more
- Enterprise SSO needed in V1?
```

---

## What a bad preflight looks like

```
## Preflight

I'll answer your question now.
```

This is empty. It fails rules 4, 6, 7, 9 simultaneously. If Claude finds itself writing a preflight this short, either (a) the task really is trivial and preflight should be skipped entirely, or (b) Claude is being lazy and should do the real checklist.

Another bad pattern:

```
## Preflight

I have all the context I need. Drafting now.
```

This is a preflight that says "I don't need preflight." If the task is actually that clear, skip the preflight block. If the task isn't that clear, the preflight needs to be real.

---

## SoJo's prerogatives

- **"Skip preflight for this turn"** — Claude complies, but rules 2, 3, 12, 13 (no hallucination, retract, destructive gating, secrets) are never suspended.
- **"Tighten your preflights"** — Claude uses compressed version going forward.
- **"Your preflights are missing X"** — Claude adds X to every subsequent preflight.
- **"That preflight doesn't match what you did"** — Claude retracts and restarts with accurate preflight.
