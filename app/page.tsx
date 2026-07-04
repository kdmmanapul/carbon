import fs from "node:fs";
import path from "node:path";

type StageStatus = "declared" | "not_declared";

type Source = {
  epdFile: string;
  page: number;
  evidence: string;
};

type StageValue = {
  status: StageStatus;
  value: number | null;
  unit: string;
  source: Source | null;
};

type ProductRecord = {
  id: string;
  epd: {
    sourceFile: string;
    publicPath: string;
  };
  product: {
    name: string;
    supplier: string;
    manufacturingLocation: string;
    compressiveStrengthMpa: number | null;
  };
  declaredUnit: {
    description: string;
    massKg: number | null;
  };
  gwp: {
    indicator: string;
    unit: string;
    stages: Record<string, StageValue>;
    fullLifecycleTotal: StageValue;
  };
  dataQuality: {
    notes: string[];
  };
};

const requiredComparisonStages = ["A1-A3", "A4", "A5", "C1", "C2", "C3", "C4", "D"];
const stageGroups = [
  { label: "Product", stages: ["A1", "A2", "A3", "A1-A3"] },
  { label: "Build", stages: ["A4", "A5"] },
  { label: "Use", stages: ["B1", "B2", "B3", "B4", "B5", "B6", "B7"] },
  { label: "End", stages: ["C1", "C2", "C3", "C4", "D"] },
];

function loadProducts(): ProductRecord[] {
  const dataDir = path.join(process.cwd(), "data");
  return fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8")) as ProductRecord)
    .sort((a, b) => (a.product.compressiveStrengthMpa ?? 0) - (b.product.compressiveStrengthMpa ?? 0));
}

function declaredTotal(product: ProductRecord): number {
  return requiredComparisonStages.reduce((sum, stage) => {
    const value = product.gwp.stages[stage];
    return value?.status === "declared" && typeof value.value === "number" ? sum + value.value : sum;
  }, 0);
}

function missingStages(product: ProductRecord): string[] {
  return requiredComparisonStages.filter((stage) => product.gwp.stages[stage]?.status !== "declared");
}

function declaredStageCount(product: ProductRecord): number {
  return requiredComparisonStages.length - missingStages(product).length;
}

function coverageText(product: ProductRecord): string {
  return `${declaredStageCount(product)}/${requiredComparisonStages.length} comparison stages`;
}

function fmt(value: number | null | undefined): string {
  if (typeof value !== "number") return "ND";
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2).replace(/\.00$/, "");
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ strength?: string; location?: string }>;
}) {
  const params = await searchParams;
  const products = loadProducts();
  const strengths = [...new Set(products.map((item) => item.product.compressiveStrengthMpa).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const locations = [...new Set(products.map((item) => item.product.manufacturingLocation))].sort();
  const selectedStrength = params?.strength ?? "all";
  const selectedLocation = params?.location ?? "all";
  const filtered = products
    .filter((item) => {
      const strengthMatch = selectedStrength === "all" || String(item.product.compressiveStrengthMpa) === selectedStrength;
      const locationMatch = selectedLocation === "all" || item.product.manufacturingLocation === selectedLocation;
      return strengthMatch && locationMatch;
    })
    .sort((a, b) => declaredTotal(a) - declaredTotal(b));
  const maxTotal = Math.max(...filtered.map(declaredTotal), 1);
  const best = filtered[0];
  const completeCoverageCount = filtered.filter((item) => missingStages(item).length === 0).length;

  return (
    <main>
      <section className="summary">
        <div>
          <p className="eyebrow">Concrete EPD Comparison</p>
          <h1>Choose lower-carbon concrete without hiding uncertainty.</h1>
          <p className="intro">Products are ranked by the sum of declared comparison stages. Every declared carbon value links back to its source EPD.</p>
        </div>
        <div className="rule" role="note">
          <strong>ND is not zero.</strong>
          <span>Totals add only declared stages, so compare module coverage before comparing rank.</span>
        </div>
      </section>

      <section className="controlBand" aria-label="Filters and result summary">
        <form className="filters">
          <label>
            Strength
            <select name="strength" defaultValue={selectedStrength}>
              <option value="all">All strengths</option>
              {strengths.map((strength) => (
                <option key={strength} value={String(strength)}>
                  {strength} MPa
                </option>
              ))}
            </select>
          </label>
          <label>
            Manufacturing location
            <select name="location" defaultValue={selectedLocation}>
              <option value="all">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Apply</button>
        </form>

        <div className="metrics" aria-label="Current result summary">
          <div>
            <span>{filtered.length}</span>
            <small>products shown</small>
          </div>
          <div>
            <span>{completeCoverageCount}</span>
            <small>complete comparison sets</small>
          </div>
          <div>
            <span>{best ? fmt(declaredTotal(best)) : "ND"}</span>
            <small>lowest declared kg CO2e/m3</small>
          </div>
        </div>
      </section>

      <section className="grid">
        {filtered.map((item, index) => {
          const total = declaredTotal(item);
          const missing = missingStages(item);
          const coverage = declaredStageCount(item);
          return (
            <article className="product" key={item.id}>
              <div className="productHead">
                <div>
                  <div className="badges">
                    {index === 0 ? <span className="badge best">Lowest declared total</span> : null}
                    <span className={missing.length === 0 ? "badge complete" : "badge partial"}>{coverageText(item)}</span>
                  </div>
                  <h2>{item.product.name}</h2>
                  <p>{item.product.supplier}</p>
                </div>
                <a href={item.epd.publicPath} target="_blank" rel="noreferrer">
                  Source EPD
                </a>
              </div>

              <dl className="facts">
                <div>
                  <dt>Strength</dt>
                  <dd>{item.product.compressiveStrengthMpa ?? "ND"} MPa</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{item.product.manufacturingLocation}</dd>
                </div>
                <div>
                  <dt>Declared unit</dt>
                  <dd>{item.declaredUnit.description}</dd>
                </div>
              </dl>

              <div className="total">
                <div className="totalTop">
                  <span>{fmt(total)}</span>
                  <small>kg CO2e/m3</small>
                </div>
                <div>
                  <i style={{ width: `${Math.max(3, (total / maxTotal) * 100)}%` }} />
                </div>
                <small>Declared-stage sum across A1-A3, A4, A5, C1-C4 and D</small>
              </div>

              <div className="coverageBar" aria-label={`Declared coverage: ${coverageText(item)}`}>
                <i style={{ width: `${(coverage / requiredComparisonStages.length) * 100}%` }} />
              </div>

              <div className="stageGroups">
                {stageGroups.map((group) => (
                  <section className="stageGroup" key={group.label} aria-label={`${group.label} stages`}>
                    <h3>{group.label}</h3>
                    <div className="stages">
                      {group.stages.map((stage) => {
                        const cell = item.gwp.stages[stage];
                        const declared = cell?.status === "declared";
                        return (
                          <a
                            className={declared ? "stage declared" : "stage missing"}
                            key={stage}
                            href={declared && cell.source ? item.epd.publicPath : undefined}
                            target={declared ? "_blank" : undefined}
                            rel="noreferrer"
                            title={declared && cell.source ? `Page ${cell.source.page}: ${cell.source.evidence}` : "Not declared in extracted data"}
                          >
                            <span>{stage}</span>
                            <strong>{fmt(cell?.value)}</strong>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {missing.length > 0 ? <p className="warning">Missing from comparison set: {missing.join(", ")}</p> : <p className="ok">All comparison stages declared.</p>}
              {item.gwp.fullLifecycleTotal.status === "declared" ? (
                <p className="note">EPD also reports full lifecycle total: {fmt(item.gwp.fullLifecycleTotal.value)} kg CO2e/m3.</p>
              ) : null}
              {item.dataQuality.notes.map((note) => (
                <p className="note" key={note}>{note}</p>
              ))}
            </article>
          );
        })}
      </section>
    </main>
  );
}
