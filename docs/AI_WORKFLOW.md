# AI Workflow for the Low Carbon Materials Hub Assessment

## Hiring Principle

Use AI like a lead engineer, not like a vending machine. The goal is not to say “AI extracted the data”; the goal is to show that you designed a workflow where AI accelerates work, but provenance, validation, and product judgment remain yours.

The strongest narrative:

> I used AI to accelerate extraction, comparison, coding, and review, but I treated every carbon number as evidence-backed data. If a value could not be traced to an EPD page, it did not enter the app as a procurement signal.

## Tool Stack

| Job | Best tools | Why |
|---|---|---|
| PDF inventory and raw extraction | `pdfplumber`, `pypdf`, Poppler, Camelot/Tabula, LlamaParse | Deterministic extraction first; AI parsers only where tables/layouts are difficult. |
| Visual PDF interpretation | Claude, Gemini, ChatGPT vision, LlamaParse screenshots | Useful for rotated pages, charts, and tables that text extraction mangles. |
| Structured JSON extraction | OpenAI Structured Outputs, Anthropic Claude, Gemini | Ask for schema-constrained JSON, but validate it with scripts. |
| Cross-checking values | Python scripts, spreadsheet pivot tables, AI reviewer | Use code for arithmetic checks; AI for “what looks suspicious?” |
| Research and standards reasoning | Perplexity, ChatGPT/Claude with sources, NotebookLM | Helps summarize EPD conventions, but never cite unsourced model claims. |
| App implementation | Codex, Cursor, GitHub Copilot, Claude Code | Use coding agents for scaffolding, UI iteration, tests, and refactors. |
| UX/data honesty review | ChatGPT, Claude, design review prompt | Ask: “Where could this UI mislead a non-expert builder?” |
| Deployment | Vercel, GitHub Actions, Vercel AI SDK if adding chat | Vercel is the requested deployment target; keep the app simple. |

References: OpenAI supports schema-constrained structured outputs, Anthropic documents PDF support for Claude, Google documents Gemini file/document understanding, LlamaIndex offers LlamaParse for document parsing, GitHub documents Copilot agentic workflows, and Vercel documents both AI SDK and deployment workflows.

## Research Layer

This assessment rewards judgment, so research should not be a generic background essay. Use research to answer practical questions that affect extraction, schema design, and UI honesty.

### Research Questions to Answer

Start with these questions before extracting all 20 PDFs:

- What declared unit is each EPD using: `1 m3`, `1 tonne`, `1 kg`, or something else?
- Which life-cycle modules are reported: `A1-A3`, individual `A1`, `A2`, `A3`, `A4`, `A5`, `B`, `C`, `D`?
- Does the EPD report `GWP-total`, `GWP-fossil`, `GWP-biogenic`, or another variant?
- Are the products ready-mix concrete, precast concrete, cement, or another concrete-adjacent product?
- Is compressive strength explicit, encoded in the product name, or missing?
- Is manufacturing location a plant, region, company headquarters, or absent?
- Are values product-specific, average, industry-average, or representative?
- Is the result table machine-readable, visually readable only, or split across pages?

Use AI to help form hypotheses, then confirm each answer against the EPD.

### Sources Worth Checking

Use these sources only when they directly improve your decisions:

- The assessment brief: extract scoring criteria and hard rules.
- The EPD PDFs: the only valid source for product carbon numbers.
- Program operator pages if an EPD registration number or validity needs context.
- EN 15804 / ISO 14025 summaries for terminology, but do not spend hours on standards theory.
- EPD table examples from similar concrete products to understand module conventions.
- Official docs for AI/document tools you actually use.

Do not cite AI-generated explanations as facts. If a model says "A1-A3 means product stage," treat that as a lead and verify from a reliable source or the EPD itself.

### Research Notebook Structure

Keep a lightweight notebook in `work/research-notes.md` while extracting:

```md
## EPD: supplier-product-file.pdf

Product:
Declared unit:
GWP indicator used:
Modules found:
Strength:
Location:
Pages checked:
Extraction method:
Uncertainties:
Decision:
```

This gives you material for `EXTRACTION.md` and the follow-up call. It also prevents the common failure mode where you remember the final JSON but forget why you trusted it.

### AI Research Prompt Pack

Brief analysis:

```text
Read this assessment brief as a hiring manager. What decisions would distinguish a strong full-stack lead submission from a merely functional one?
```

EPD terminology:

```text
Explain the EPD terms I need for this task: declared unit, life-cycle modules, GWP-total, not declared, not applicable, and module D. Keep it practical for app and data modeling decisions. Include uncertainty warnings.
```

Document triage:

```text
Given this list of PDF filenames, page counts, and extracted snippets, group the EPDs by likely template/layout. Recommend an extraction strategy and risk level for each group.
```

Schema critique:

```text
Act as a data architect for a carbon materials comparison tool. Review this schema for provenance, missing-data semantics, comparability, and future review workflows. Identify what could mislead a buyer.
```

Extraction challenge:

```text
I am extracting GWP-total values from an EPD table. Here is the raw text and a screenshot OCR result. Identify the most likely module/value pairs, but mark any uncertainty. Do not fill missing modules by inference.
```

Adversarial review:

```text
Act as a skeptical reviewer. Find every way this extracted JSON could be wrong, misleading, or insufficiently traceable. Prioritize risks that would affect procurement decisions.
```

Interview prep:

```text
Ask me 12 hard follow-up questions about my extraction architecture, schema choices, validation strategy, UI honesty, and how I would productionize this.
```

### Research Output That Helps You Get Hired

Turn research into visible artifacts:

- `EXTRACTION.md` explains your decisions, not just your tools.
- JSON `notes` fields preserve uncertainty and edge cases.
- UI warnings show comparability limitations.
- README or submission notes mention what you would productionize next.
- The interview story names specific examples where you changed approach after evidence.

The phrase you want to earn is: "This person can use AI quickly, but they know how to keep it accountable."

## End-to-End Workflow

### 1. Read the Brief Like a Product Lead

Before touching tools, write the assessment criteria in your own words:

- The core deliverable is not a pretty app; it is trustworthy comparison.
- Every carbon number must have provenance.
- Missing, not declared, not applicable, and zero are different states.
- Part 2 depends on Part 1, so the schema is a product decision.

AI prompt:

```text
Read this assessment brief. Extract the scoring signals, hidden risks, and what a strong senior/full-stack lead submission should demonstrate. Do not propose implementation yet.
```

Human decision:

Choose “honest thin slice” over “complete-looking but unverified.”

### 2. Build a Source Inventory

Use deterministic tooling first:

- Save all PDFs in `/source` or `/public/epds`.
- Generate an inventory CSV: filename, page count, file size, apparent EPD family, product clues from filename.
- Extract raw text and table previews into scratch files.

Tools:

- `pdfinfo` or `pypdf` for metadata and page counts.
- `pdfplumber` for text/table extraction.
- Poppler `pdftoppm` for page screenshots.

AI prompt:

```text
Here is a PDF filename inventory and extracted keyword lines. Cluster these EPDs by layout/template family. Tell me which extraction strategy each family probably needs and what could go wrong.
```

Human decision:

Do not use one universal parser. EPD Hub, EPD Australasia, GCCA slide-style, and catalogue EPDs behave differently.

### 3. Define the JSON Schema Before Extracting Everything

Recommended schema shape:

```json
{
  "schemaVersion": "1.0",
  "id": "string",
  "epd": {
    "sourceFile": "string",
    "publicPath": "string",
    "registrationNumber": "string|null"
  },
  "product": {
    "name": "string",
    "supplier": "string",
    "manufacturingLocation": "string",
    "compressiveStrengthMpa": "number|null"
  },
  "declaredUnit": {
    "description": "string",
    "massKg": "number|null"
  },
  "gwp": {
    "indicator": "GWP-total",
    "unit": "kg CO2e per m3",
    "stages": {
      "A1-A3": {
        "status": "declared|not_declared|not_applicable|unknown",
        "value": "number|null",
        "source": {
          "epdFile": "string",
          "page": "number",
          "evidence": "string"
        }
      }
    }
  },
  "dataQuality": {
    "confidence": "high|medium|low",
    "notes": ["string"]
  }
}
```

AI prompt:

```text
Review this JSON schema for an app comparing concrete EPDs. The hard rule is provenance for every carbon figure. What fields are missing? What fields could mislead users if modeled badly?
```

Human decision:

Make provenance a property of every value, not just the document.

### 4. Extract in Two Passes

Pass A: deterministic extraction

- Use scripts to capture product name, declared unit, strength, location, and GWP rows.
- Normalize scientific notation and decimal commas.
- Preserve module labels exactly.

Pass B: AI-assisted extraction

Use Claude/Gemini/ChatGPT vision only for pages where:

- table extraction is scrambled,
- PDF text is rotated,
- values are embedded in charts,
- product catalogues contain many rows,
- filename and visible product table disagree.

AI prompt:

```text
Extract only GWP-total values from this rendered EPD page. Return JSON only.
For each value include: module, value, unit, page, exact visual evidence.
If a module is not visible, return status not_declared. Do not infer missing modules.
```

Human decision:

If AI and deterministic extraction disagree, render the page and inspect it yourself.

### 5. Validate Like a Skeptic

Use scripts, not vibes:

- Assert 20 JSON files exist.
- Assert every declared carbon value has `source.epdFile`, `source.page`, and `source.evidence`.
- Assert linked PDFs exist.
- Check `A1 + A2 + A3 ~= A1-A3` where all are declared.
- Flag negative D values as allowed but visually reviewed.
- Flag products with only aggregate totals.
- Flag catalogue EPDs.

AI prompt:

```text
Here is the extracted JSON summary. Act as a skeptical LCA data reviewer. Identify values that look structurally suspicious, not just numerically high or low.
```

Human decision:

Do not hide caveats. Put them in the data and UI.

### 6. Write `EXTRACTION.md`

Keep it sharp. Structure:

1. Strategy
2. Architecture/tools
3. Accuracy and failure modes
4. What you tried and changed

AI prompt:

```text
Rewrite this extraction process as a concise 400-600 word assessment note. Make it sound like a lead engineer explaining tradeoffs. Do not make it sound like a tool survey.
```

Human decision:

Mention specific hard cases. That makes the work credible.

### 7. Build the App Around Honesty

Core UI:

- Product cards or comparison table.
- Filter by strength and location.
- Stage-by-stage GWP display.
- `ND` visibly distinct from `0`.
- Total says “sum of declared stages only.”
- Every value links to source EPD.
- Warnings when products do not share comparable module coverage.

AI prompt for coding agent:

```text
Build a small Next.js TypeScript app from these JSON files. The app must help a non-expert compare concrete products without mistaking not-declared stages for zero. Prioritize data honesty over visual polish.
```

AI prompt for UX review:

```text
Review this UI as if you are a builder choosing concrete. Where could the interface mislead me into making a bad procurement decision? Suggest precise fixes.
```

Human decision:

Do not add a chatbot unless the base comparison workflow is already clear.

### 8. Use AI for Code Review, Not Just Code Generation

Run three review passes:

1. Data integrity review
2. UI honesty review
3. Deployment/runtime review

AI prompt:

```text
Review this repository for assessment risk. Focus on bugs, misleading data presentation, missing provenance, and deployment issues. Give findings by severity with file references.
```

### 9. Deploy and Prepare the Interview Story

Deployment:

- Push to GitHub.
- Import repo into Vercel.
- Add the Vercel link to README/submission.
- Confirm source PDF links work in production.

Interview story:

- “I started with the hard rule: provenance.”
- “I used deterministic extraction first, AI only where layout made it useful.”
- “I represented uncertainty in the schema instead of hiding it in the UI.”
- “I would productionize this with bounding-box provenance, confidence scoring, review queues, and EPD-family-specific parsers.”

## What Not To Do

- Do not say AI extracted everything perfectly.
- Do not use one headline A1-A3 number as “full lifecycle.”
- Do not treat ND as zero.
- Do not compare products without showing module coverage.
- Do not cite AI-generated facts without sources.
- Do not overbuild visual polish while data remains weak.

## Best Final Stack for This Assessment

Minimum strong stack:

- Python: `pdfplumber`, `pypdf`, Poppler
- AI: ChatGPT/Codex for coding and reasoning, Claude or Gemini for PDF visual cross-checks
- Optional parser: LlamaParse for difficult table PDFs
- App: Next.js, TypeScript, static JSON data
- Deploy: GitHub + Vercel

The winning move is not using the most AI. The winning move is showing that you know exactly where AI is helpful, where it is dangerous, and how to build guardrails around it.

## Sources

- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Anthropic Claude PDF support: https://docs.anthropic.com/en/docs/build-with-claude/pdf-support
- Gemini document understanding: https://ai.google.dev/gemini-api/docs/document-processing
- LlamaParse: https://www.llamaindex.ai/llamaparse
- GitHub Copilot docs: https://docs.github.com/en/copilot
- Vercel AI SDK: https://vercel.com/docs/ai-sdk
- Vercel deployments: https://vercel.com/docs/deployments
