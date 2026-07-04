import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const publicEpdsDir = path.join(root, "public", "epds");
const requiredStages = ["A1", "A2", "A3", "A1-A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C1", "C2", "C3", "C4", "D"];

const errors = [];
const warnings = [];
let declaredValues = 0;

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateStage(file, label, stage) {
  if (!isObject(stage)) {
    fail(file, `${label} is missing or not an object`);
    return;
  }

  if (!["declared", "not_declared"].includes(stage.status)) {
    fail(file, `${label} has invalid status ${stage.status}`);
  }

  if (stage.status === "declared") {
    declaredValues += 1;

    if (typeof stage.value !== "number" || Number.isNaN(stage.value)) {
      fail(file, `${label} is declared but has no numeric value`);
    }

    if (!isObject(stage.source)) {
      fail(file, `${label} is declared but has no source object`);
      return;
    }

    if (!stage.source.epdFile || typeof stage.source.epdFile !== "string") {
      fail(file, `${label} has no source EPD filename`);
    }

    if (stage.source.epdFile && !fs.existsSync(path.join(publicEpdsDir, stage.source.epdFile))) {
      fail(file, `${label} points to missing PDF ${stage.source.epdFile}`);
    }

    if (typeof stage.source.page !== "number" || stage.source.page < 1) {
      fail(file, `${label} has invalid source page`);
    }

    if (!stage.source.evidence || typeof stage.source.evidence !== "string") {
      fail(file, `${label} has no evidence text`);
    }
  }

  if (stage.status === "not_declared") {
    if (stage.value !== null) {
      fail(file, `${label} is not_declared but has a value`);
    }
    if (stage.source !== null) {
      fail(file, `${label} is not_declared but has a source`);
    }
  }
}

const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".json")).sort();

if (files.length !== 20) {
  fail("data", `expected 20 JSON files, found ${files.length}`);
}

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  const record = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  if (!record.id) fail(file, "missing id");
  if (!record.epd?.sourceFile) fail(file, "missing epd.sourceFile");
  if (!record.epd?.publicPath) fail(file, "missing epd.publicPath");
  if (!record.product?.name) fail(file, "missing product.name");
  if (!record.product?.supplier) fail(file, "missing product.supplier");
  if (!record.product?.manufacturingLocation) fail(file, "missing product.manufacturingLocation");
  if (!record.declaredUnit?.description) fail(file, "missing declaredUnit.description");
  if (record.gwp?.indicator !== "GWP-total") warn(file, `GWP indicator is ${record.gwp?.indicator ?? "missing"}, expected GWP-total`);

  if (record.epd?.sourceFile && !fs.existsSync(path.join(publicEpdsDir, record.epd.sourceFile))) {
    fail(file, `source PDF is missing from public/epds: ${record.epd.sourceFile}`);
  }

  for (const stage of requiredStages) {
    validateStage(file, `gwp.stages.${stage}`, record.gwp?.stages?.[stage]);
  }

  validateStage(file, "gwp.fullLifecycleTotal", record.gwp?.fullLifecycleTotal);

  const a1 = record.gwp?.stages?.A1;
  const a2 = record.gwp?.stages?.A2;
  const a3 = record.gwp?.stages?.A3;
  const aggregate = record.gwp?.stages?.["A1-A3"];
  const hasSplitProductStage = [a1, a2, a3, aggregate].every((stage) => stage?.status === "declared");

  if (hasSplitProductStage) {
    const sum = a1.value + a2.value + a3.value;
    const diff = Math.abs(sum - aggregate.value);
    const tolerance = Math.max(0.5, Math.abs(aggregate.value) * 0.02);
    if (diff > tolerance) {
      warn(file, `A1+A2+A3 (${sum}) does not closely match A1-A3 (${aggregate.value})`);
    }
  }
}

console.log(`Validated ${files.length} JSON files.`);
console.log(`Checked ${declaredValues} declared carbon values with provenance.`);

if (warnings.length > 0) {
  console.warn(`\nWarnings (${warnings.length}):`);
  for (const message of warnings) console.warn(`- ${message}`);
}

if (errors.length > 0) {
  console.error(`\nErrors (${errors.length}):`);
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log("Data validation passed.");
