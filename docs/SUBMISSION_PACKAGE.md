# Low Carbon Materials Hub Assessment Submission Package

## Deadline Reality Check

The stated deadline is **04 July 2026, 12:00am AEST**. Literally, that is midnight at the start of July 4 in Australia, which is **03 July 2026, 10:00pm Asia/Manila**. If the sender meant "end of day July 4," they may have written it ambiguously. Treat this as urgent and submit as soon as the GitHub and Vercel links are ready.

## What They Are Actually Testing

They are not mainly testing whether you can build a polished dashboard. They are testing whether you can lead a messy, high-trust data product:

- Can you turn inconsistent EPD PDFs into structured data without lying?
- Can you use AI quickly without outsourcing judgment to it?
- Can you design a schema that preserves provenance and uncertainty?
- Can you build a thin app that helps a non-expert make a safer decision?
- Can you explain tradeoffs clearly to a CTO?

The sentence to keep in your head:

> A carbon number with no provenance is worse than no number.

## Submission Must Include

- GitHub repo link
- Vercel deployment link
- `EXTRACTION.md`
- `data/*.json`, one JSON file per EPD
- Next.js + Node.js + TypeScript app
- Source PDF provenance for every carbon figure

## Current Local Project

Working folder:

`C:\Users\USER\Downloads\Kodastra\kd_work\carbon_work`

Current status:

- 20 JSON files exist.
- Source PDFs are included under `public/epds`.
- The app builds successfully.
- `pnpm run validate:data` passes.
- `pnpm run typecheck` passes.
- `pnpm run build` passes.
- UI has been improved to show ranking, stage coverage, missing-data warnings, and source EPD links.

## Best AI Workflow

### 1. Read and Restate the Brief

Use ChatGPT, Claude, or Gemini before writing code.

Prompt:

```text
Read this assessment brief as a hiring manager. Extract the scoring signals, hidden risks, and what a strong Full Stack Lead submission should demonstrate. Do not propose implementation yet.
```

Output to create:

- A private checklist of requirements.
- A short product principle: "honest comparison over false completeness."

### 2. Research the Domain Before Extraction

Use Perplexity, Claude, ChatGPT, Gemini, or NotebookLM for terminology, but verify against the EPDs.

Research questions:

- What is an EPD?
- What are EN 15804 life-cycle modules?
- What is `GWP-total`?
- What is the difference between `not declared`, `not applicable`, `zero`, and `unknown`?
- What are A1-A3, A4, A5, C1-C4, and D?
- What does a declared unit mean?

Important rule:

AI can explain terminology, but the EPD PDF is the source for every product carbon number.

### 3. Use Google's Stitch for UI Direction, Not Data

Use Google Stitch for quick UI exploration only. Reports in 2025-2026 describe Stitch as a Google Labs AI UI design tool that can turn natural language and visual references into interface designs or front-end code. Treat it as a design ideation tool, not as your source of truth.

Prompt for Stitch:

```text
Design a practical data-comparison interface for builders choosing lower-carbon concrete. The UI should feel like a serious procurement decision tool, not a marketing landing page. It must compare products by lifecycle stage, show missing data clearly, support strength and location filters, and make source EPD provenance visible.
```

What to take from Stitch:

- Layout ideas
- Visual hierarchy
- Card/table composition
- Empty/missing-data states

What not to take blindly:

- Carbon numbers
- EPD terminology
- Schema decisions
- Claims about comparability

### 4. Use Claude or Gemini for PDF Visual Cross-Checks

Use Claude, Gemini, or ChatGPT vision for hard PDF pages:

- Rotated tables
- Scanned pages
- Catalogue-style product tables
- Tables where text extraction scrambles columns

Prompt:

```text
Extract only visible GWP-total values from this EPD page. Return JSON only. For each value include module, value, unit, page, and the exact visible evidence. If a module is not visible, return not_declared. Do not infer missing modules.
```

Human responsibility:

- Compare AI output with raw text extraction.
- Render suspicious pages and inspect them.
- Do not include a number unless it has page-level provenance.

### 5. Use Codex/Cursor for Implementation

Use Codex, Cursor, or GitHub Copilot for:

- Next.js scaffolding
- TypeScript data modeling
- UI implementation
- validation scripts
- refactoring
- deployment debugging

Prompt:

```text
Build a Next.js TypeScript app from these JSON files. The app must help a non-expert compare concrete products without mistaking not_declared stages for zero. Prioritize data honesty, provenance links, and lifecycle-stage comparison over visual polish.
```

### 6. Use AI as a Reviewer

Run three review passes:

Data reviewer:

```text
Act as a skeptical LCA data reviewer. Find every extracted value that may be wrong, incomparable, or insufficiently traceable.
```

UX reviewer:

```text
Act as a non-expert builder choosing concrete. Where could this UI mislead me into making a bad procurement decision?
```

CTO reviewer:

```text
Review this repo as a CTO hiring a Full Stack Lead. Focus on architecture, data integrity, provenance, deployment risk, and whether the candidate made good tradeoffs.
```

### 7. Validate With Code

AI is not the validator. Code is.

Checks to run:

```bash
pnpm run validate:data
pnpm run typecheck
pnpm run build
```

Validator should confirm:

- There are 20 JSON files.
- Every declared carbon figure has `epdFile`, `page`, and `evidence`.
- Source PDFs exist.
- `not_declared` values do not have fake zeros.
- A1 + A2 + A3 roughly matches A1-A3 where all are declared.

### 8. Deploy

Use GitHub + Vercel.

Before sending:

- Open the live Vercel URL.
- Test filters.
- Click source EPD links.
- Confirm missing stages are visible.
- Confirm the UI does not imply full comparability where data is missing.

## How To Talk About AI In The Submission

Do not say:

> I used AI to extract the PDFs.

Say:

> I used AI to accelerate parts of the workflow, especially document triage, visual checks, UI iteration, and code review. I kept deterministic scripts and human verification in the loop for extracted carbon values, because the brief's provenance rule makes unsupported numbers unacceptable.

This is the strongest positioning because it matches their note:

- They expect AI tools.
- They care how critically you use them.
- They care more about decisions and reasoning than polish.
- They have a hard provenance rule.

## Final Reply Email

Subject: Low Carbon Materials Hub Technical Assessment Submission

Hi [Name],

Thank you again for inviting me to complete the Full Stack Lead Developer technical assessment.

I have submitted the assessment here:

GitHub repo: [GITHUB_REPO_LINK]  
Vercel deployment: [VERCEL_DEPLOYMENT_LINK]

I focused the implementation around the brief's hard rule on provenance: every declared carbon figure in the app is traceable back to its source EPD, including the source file, page, and evidence note. I also treated missing or not-declared lifecycle stages as explicit missing data rather than zero, because that distinction matters for real procurement decisions.

I used AI tools during the process, but deliberately kept them inside a validation workflow rather than treating them as the source of truth. In practice, that meant using AI for document triage, UI exploration, visual cross-checking, implementation support, and review prompts, while relying on structured JSON, validation scripts, and source-PDF checks for the carbon data itself.

The repo includes:

- `EXTRACTION.md` with my extraction reasoning and tradeoffs
- `data/*.json` with one structured record per EPD
- source PDFs under `public/epds`
- a Next.js + TypeScript app for filtering and comparing products
- a data validation script to check provenance coverage

I am looking forward to discussing the decisions, tradeoffs, and what I would productionize next during the interview with the CTO.

Best,  
[YOUR_NAME]

## Shorter Reply Email

Subject: Low Carbon Materials Hub Assessment Submission

Hi [Name],

Thank you again for the opportunity. My technical assessment submission is here:

GitHub repo: [GITHUB_REPO_LINK]  
Vercel deployment: [VERCEL_DEPLOYMENT_LINK]

I focused on honest comparison rather than visual polish: every declared carbon figure is traceable to a source EPD, and not-declared lifecycle stages are represented as missing data rather than zero. I also included `EXTRACTION.md` to explain the extraction strategy, validation approach, and tradeoffs.

I used AI tools to accelerate triage, visual checks, implementation, and review, but kept the carbon data grounded in source PDFs and validation scripts because unsupported numbers would be actively harmful in this domain.

Looking forward to discussing it further with the team.

Best,  
[YOUR_NAME]

## CTO Interview Talking Points

- I started from the provenance rule, not from the UI.
- I modeled missing data explicitly because ND is not zero.
- I chose a thin JSON schema that the app could trust.
- I used deterministic extraction first and AI for hard visual cases.
- I added validation scripts because AI review is not enough.
- I designed the UI to show coverage and comparability limits.
- I would productionize with bounding-box provenance, review queues, parser families, confidence scoring, and audit trails.

## Red Flags To Avoid

- Do not overclaim extraction accuracy.
- Do not say all products are directly comparable.
- Do not call A1-A3 "full lifecycle."
- Do not hide missing stages.
- Do not rely on AI-generated facts without source checks.
- Do not send without testing source EPD links in production.

## Sources Checked For Workflow Context

- Google Stitch reporting: https://www.theverge.com/news/670773/google-labs-stitch-ui-coding-design-tool
- Google Stitch 2026 update reporting: https://www.androidcentral.com/apps-software/google-labs-stitch-is-a-design-canvas-that-turns-your-voice-into-an-app
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Claude PDF support: https://docs.anthropic.com/en/docs/build-with-claude/pdf-support
- Gemini document processing: https://ai.google.dev/gemini-api/docs/document-processing
- Vercel deployments: https://vercel.com/docs/deployments
