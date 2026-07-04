# Extraction reasoning

## Overall strategy

I started from the rule that every carbon number must be traceable. For this domain, a neat-looking comparison is dangerous if it turns "not declared" into zero or mixes lifecycle coverage without warning. So I treated each PDF as evidence first, and the JSON as a structured audit trail second.

The schema is intentionally close to the app's needs: product name, supplier, manufacturing location, compressive strength, declared unit, and `GWP-total` values by lifecycle module. Each stage has a `status`, `value`, `unit`, and `source` object with EPD filename, page, and evidence text. That makes missing data explicit and lets the UI show provenance without needing to rediscover it.

## Model and architecture

I used a thin extraction pipeline rather than a single AI "read these PDFs" step. The first pass used deterministic tools: `pypdf`/`pdfplumber` for text and table extraction, simple scripts to inventory the 20 PDFs, and generated scratch text/table files for review. I then used rendered pages for cases where the extracted text looked wrong, especially rotated tables, catalogue-style EPDs, and chart-like layouts.

I used AI as a reviewer and accelerator, not as the authority. It was useful for thinking through schema design, spotting likely table-family differences, UI iteration, and asking "what could mislead a builder here?" I avoided making AI the direct source of carbon values because the failure mode is too costly: a plausible unsupported number would look legitimate in the app.

## Accuracy

My checks were deliberately boring. The validation script asserts that all 20 JSON files exist, every declared carbon value has source file/page/evidence, linked PDFs exist, and `not_declared` values do not carry fake zeroes. Where A1, A2, A3, and A1-A3 were all present, I checked that the split stages roughly matched the aggregate. I also normalized scientific notation and visually checked suspicious pages before carrying values into JSON.

The most important accuracy decision was not to force all EPDs into the same shape. Some EPD Hub files expose clean module tables. Some Australasia/Holcim documents report A1-A3 plus selected downstream modules. Some GCCA-style documents give product-stage or total figures without reliable module detail. The JSON preserves those differences instead of making the app pretend the products are fully comparable.

## Research and process

I questioned three things while extracting: what the declared unit was, whether the value was specifically `GWP-total`, and whether a lifecycle stage was actually declared or just absent from the table. Two examples changed my approach. The Adbri table needed visual review because text extraction around the rotated table was unreliable. The Hymix catalogue-style document could not be treated like a single-product EPD, so I kept notes rather than hiding that limitation.

What could still go wrong: catalogue EPDs may contain additional variants that deserve separate records, and some PDFs may have detailed module data that would need a stronger vision/table extraction pass. In production I would store raw table artifacts, bounding boxes, confidence scores, EPD-family-specific parsers, and a human review queue. For this assessment I optimized for honest comparability over false completeness.
