# Low Carbon Materials Hub

Thin-slice take-home assessment for comparing concrete EPDs by embodied carbon, with provenance attached to every extracted carbon figure.

## What Is Included

- `EXTRACTION.md` explains the extraction strategy, tradeoffs, accuracy checks, and failure modes.
- `data/*.json` contains one structured record per EPD.
- `public/epds/*.pdf` contains the source PDFs linked from the app.
- `app/` contains the Next.js interface for filtering and comparing products.
- `scripts/validate-data.mjs` checks the hard provenance rule mechanically.

## Run Locally

```bash
pnpm install
pnpm run validate:data
pnpm run dev
```

Then open `http://localhost:3000`.

## Data Model Principles

- `not_declared` is not treated as zero.
- GWP values are stored stage by stage.
- Every declared carbon value must include source file, page, and evidence text.
- The UI sums only declared comparison stages and labels that limitation.
- Source EPD links remain visible from the product card and stage cells.

## Follow-Up Improvements

- Store bounding boxes for each extracted value.
- Add a review queue for low-confidence EPD rows.
- Preserve raw table extraction artifacts for audit.
- Add EPD-family-specific parsers once more documents are available.
- Add automated visual regression checks for the comparison table.
