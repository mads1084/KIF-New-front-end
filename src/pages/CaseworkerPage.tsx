import { useState, useMemo, useRef } from "react";
import { useCase } from "../contexts/CaseContext";
import { quickEval, KravResult } from "../utils/quickEval";
import type { CaseJSON, IncomeMonth } from "../utils/formToJSON";
import satsoversigt from "../data/satsoversigt_dagpenge_v_final.json";

/* ───────────────── SCENARIOS ───────────────── */

interface ScenarioIncome {
  month: string;
  gross: number;
  hours: number;
  type?: string;
}

const SCENARIOS: Record<string, { label: string; income: ScenarioIncome[] }> = {
  case_001_mathias: {
    label: "Mathias — sygdom, lav indkomst",
    income: [
      { month: "2022-04", gross: 77825.78, hours: 160.33 },
      { month: "2022-05", gross: 83811.32, hours: 160.33 },
      { month: "2022-06", gross: 97825.78, hours: 316.18 },
      { month: "2022-07", gross: 77825.78, hours: 160.33 },
      { month: "2022-08", gross: 80153.06, hours: 160.33 },
      { month: "2022-09", gross: 172518.60, hours: 160.33 },
      { month: "2022-10", gross: 5358.00, hours: 44.40, type: "Sygdom" },
      { month: "2023-05", gross: 20000.00, hours: 151.31 },
    ],
  },
  case_002_anders: {
    label: "Anders — normal, høj indkomst",
    income: [
      { month: "2023-03", gross: 38500, hours: 160.33 },
      { month: "2023-04", gross: 38500, hours: 160.33 },
      { month: "2023-05", gross: 38500, hours: 160.33 },
      { month: "2023-06", gross: 42100, hours: 168.50 },
      { month: "2023-07", gross: 38500, hours: 160.33 },
      { month: "2023-08", gross: 38500, hours: 160.33 },
      { month: "2023-09", gross: 38500, hours: 160.33 },
      { month: "2023-10", gross: 38500, hours: 160.33 },
      { month: "2023-11", gross: 38500, hours: 160.33 },
      { month: "2023-12", gross: 53200, hours: 160.33 },
      { month: "2024-01", gross: 39800, hours: 160.33 },
      { month: "2024-02", gross: 39800, hours: 160.33 },
    ],
  },
  tom: {
    label: "Ingen indkomstdata",
    income: [],
  },
};

/* ───────────────── SATS HELPERS ───────────────── */

interface SatsVaerdi {
  krav: string;
  vaerdi: string;
  forsikringsstatus: string;
}

function findSatsValue(category: string, kravMatch: string, forsikring?: string): string | null {
  const cat = (satsoversigt as unknown as Record<string, { vaerdier?: SatsVaerdi[] }>)[category];
  if (!cat?.vaerdier) return null;
  for (const v of cat.vaerdier) {
    const matchesKrav = v.krav.toLowerCase().includes(kravMatch.toLowerCase());
    const matchesForsikring = !forsikring || v.forsikringsstatus === forsikring || v.forsikringsstatus === "begge";
    if (matchesKrav && matchesForsikring) return v.vaerdi;
  }
  return null;
}

function parseNumber(satsValue: string | null): number | null {
  if (!satsValue) return null;
  const match = satsValue.replace(/\./g, "").match(/[\d,]+/);
  if (!match) return null;
  return parseFloat(match[0].replace(",", "."));
}

/* ───────────────── COMPONENT ───────────────── */

export default function CaseworkerPage() {
  const { caseJSON, setCaseJSON, kravResults, setKravResults } = useCase();
  const [incomeRows, setIncomeRows] = useState<ScenarioIncome[]>([]);
  const [localKravResults, setLocalKravResults] = useState<KravResult[]>([]);
  const [analysisJSON, setAnalysisJSON] = useState<Record<string, unknown> | null>(null);
  const [importError, setImportError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisInputRef = useRef<HTMLInputElement>(null);

  // Determine forsikring and year from caseJSON
  const forsikring = caseJSON?.citizen_info.membership_status === "Fuldtidsforsikret" ? "fuldtid" : "deltid";
  const year = caseJSON
    ? parseInt(caseJSON.citizen_info.first_unemployment_date.split("-")[2] || "2025")
    : 2025;
  const catKey = `indkomstkrav_bek_${year}`;

  // Compute income stats
  const incomeStats = useMemo(() => {
    const loftVal = parseNumber(findSatsValue(catKey, "Indkomstloft", forsikring));
    const kravVal = parseNumber(findSatsValue(catKey, "Indkomstkrav", forsikring));
    const totalGross = incomeRows.reduce((sum, r) => sum + r.gross, 0);
    const totalCapped = loftVal
      ? incomeRows.reduce((sum, r) => sum + Math.min(r.gross, loftVal), 0)
      : totalGross;
    const meetsRequirement = kravVal !== null ? totalCapped >= kravVal : null;
    const pct = kravVal && kravVal > 0 ? Math.min((totalCapped / kravVal) * 100, 100) : 0;
    return { totalGross, totalCapped, loftVal, kravVal, meetsRequirement, pct };
  }, [incomeRows, catKey, forsikring]);

  // Display results: prefer local (from this panel) but fall back to context
  const displayResults = localKravResults.length > 0 ? localKravResults : kravResults;

  /* ── Handlers ── */

  function loadScenario(key: string) {
    const scenario = SCENARIOS[key];
    if (scenario) setIncomeRows([...scenario.income]);
  }

  function updateRow(idx: number, field: keyof ScenarioIncome, value: string) {
    setIncomeRows(prev => {
      const copy = [...prev];
      if (field === "month" || field === "type") {
        copy[idx] = { ...copy[idx], [field]: value };
      } else {
        copy[idx] = { ...copy[idx], [field]: parseFloat(value) || 0 };
      }
      return copy;
    });
  }

  function deleteRow(idx: number) {
    setIncomeRows(prev => prev.filter((_, i) => i !== idx));
  }

  function addRow() {
    setIncomeRows(prev => [...prev, { month: "", gross: 0, hours: 0 }]);
  }

  function runEvaluation() {
    if (!caseJSON) return;
    const withIncome: CaseJSON = {
      ...caseJSON,
      income_statement: {
        source: "sagsbehandler",
        period_from: incomeRows.length > 0 ? incomeRows[0].month : "",
        period_to: incomeRows.length > 0 ? incomeRows[incomeRows.length - 1].month : "",
        monthly_income: incomeRows.map(r => ({
          month: r.month,
          gross: r.gross,
          hours: r.hours,
          type: r.type,
        })),
      },
    };
    const results = quickEval(withIncome);
    setLocalKravResults(results);
    setKravResults(results);
  }

  function handleImportJSON() {
    fileInputRef.current?.click();
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as CaseJSON;
        setCaseJSON(data);
        setImportError("");
      } catch {
        setImportError("Ugyldig JSON-fil.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleExportJSON() {
    if (!caseJSON) return;
    const blob = new Blob([JSON.stringify(caseJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case_${caseJSON.citizen_info.cpr_number || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClearCase() {
    setCaseJSON(null);
    setKravResults([]);
    setLocalKravResults([]);
    setIncomeRows([]);
    setAnalysisJSON(null);
  }

  function handleUploadAnalysis() {
    analysisInputRef.current?.click();
  }

  function onAnalysisFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setAnalysisJSON(JSON.parse(reader.result as string) as Record<string, unknown>);
      } catch {
        setAnalysisJSON({ error: "Ugyldig JSON-fil." } as Record<string, unknown>);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ── Helpers ── */

  function statusColor(r: KravResult): string {
    if (r.passed === true) return "bg-emerald-100 text-emerald-800";
    if (r.passed === false) return "bg-red-100 text-red-800";
    if (r.requiresDeepAnalysis) return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-600";
  }

  function statusLabel(r: KravResult): string {
    if (r.passed === true) return "Opfyldt";
    if (r.passed === false) return "Ikke opfyldt";
    if (r.requiresDeepAnalysis) return "Kræver vurdering";
    return "Afventer";
  }

  const ci = caseJSON?.citizen_info;

  /* ── RENDER ── */

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-['DM_Sans']">
      <h1 className="text-2xl font-bold text-gray-900">Sagsbehandler-panel</h1>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={onImportFile} />
      <input ref={analysisInputRef} type="file" accept=".json" className="hidden" onChange={onAnalysisFile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── PANEL 1: Case-oversigt ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Case-oversigt</h2>
          {ci ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{ci.name}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{ci.cpr_number}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {ci.membership_status}, {ci.citizenship_ees === "Ja" ? "EØS-statsborger" : "ikke-EØS"}.
                {" "}Ledig fra {ci.first_unemployment_date} — årsag: {ci.unemployment_reason.toLowerCase()}.
                {ci.unemployed_on_jobnet ? " Tilmeldt Jobnet." : " Ikke tilmeldt Jobnet."}
                {ci.first_sick_day && ` Sygeperiode: ${ci.first_sick_day} – ${ci.last_sick_day}.`}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Ingen case indlæst. Udfyld ansøgning på KIForvaltning-siden.</p>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={handleClearCase} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Ryd case
            </button>
          </div>
        </div>

        {/* ── PANEL 3: Kvik-evaluering ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kvik-evaluering</h2>
          <button
            onClick={runEvaluation}
            disabled={!caseJSON}
            className="mb-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 text-sm font-medium"
          >
            Kør evaluering
          </button>

          {displayResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 font-medium text-gray-500">Krav</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-500">Status</th>
                    <th className="text-left py-2 font-medium text-gray-500">Begrundelse</th>
                  </tr>
                </thead>
                <tbody>
                  {displayResults.map(r => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 font-medium text-gray-800">{r.title}</td>
                      <td className="py-2 pr-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r)}`}>
                          {statusLabel(r)}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{r.finding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Klik "Kør evaluering" for at se resultater.</p>
          )}
        </div>

        {/* ── PANEL 2: Indkomsttabel ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          {!caseJSON && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="text-lg">&#9888;</span>
              <span>Ingen ansøgning indlæst — indkomstloft og krav kan ikke beregnes. Udfyld ansøgningen på <strong>KIForvaltning</strong>-siden først.</span>
            </div>
          )}
          {caseJSON && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span className="text-lg">&#9745;</span>
              <span>Ansøgning loaded — <strong>{caseJSON.citizen_info.name}</strong>, {forsikring}sforsikret, kravår {year}.</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-800">Indkomsttabel</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Indlæs scenario:</label>
              <select
                onChange={e => loadScenario(e.target.value)}
                defaultValue=""
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="" disabled>Vælg…</option>
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Måned</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Bruttoindkomst (kr.)</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Timer</th>
                  <th className="text-left py-2 pr-3 font-medium text-gray-500">Type</th>
                  <th className="py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {incomeRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-1.5 pr-3">
                      <input
                        type="text"
                        value={row.month}
                        onChange={e => updateRow(idx, "month", e.target.value)}
                        placeholder="YYYY-MM"
                        className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        type="number"
                        value={row.gross}
                        onChange={e => updateRow(idx, "gross", e.target.value)}
                        className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        type="number"
                        value={row.hours}
                        onChange={e => updateRow(idx, "hours", e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <input
                        type="text"
                        value={row.type || ""}
                        onChange={e => updateRow(idx, "type", e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-1.5">
                      <button
                        onClick={() => deleteRow(idx)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        title="Slet"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addRow}
            className="mt-3 px-3 py-1.5 text-sm text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            + Tilføj måned
          </button>

          {/* Income calculation */}
          {incomeRows.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Samlet bruttoindkomst:</span>
                <span className="font-medium">{incomeStats.totalGross.toLocaleString("da-DK", { maximumFractionDigits: 2 })} kr.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Samlet med loft ({incomeStats.loftVal?.toLocaleString("da-DK") ?? "?"} kr./md):
                </span>
                <span className="font-medium">{incomeStats.totalCapped.toLocaleString("da-DK", { maximumFractionDigits: 2 })} kr.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Indkomstkrav ({year}, {forsikring}):</span>
                <span className="font-medium">{incomeStats.kravVal?.toLocaleString("da-DK") ?? "?"} kr.</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      incomeStats.meetsRequirement ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${incomeStats.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{incomeStats.pct.toFixed(1)}% af krav</span>
                  <span>{incomeStats.meetsRequirement ? "Opfyldt" : "Ikke opfyldt"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── PANEL 4: Afgørelsesbrev + Juridisk analyse ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Venstre: Afgørelsesbrev */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Afgørelsesbrev</h2>
              <textarea
                readOnly
                className="w-full h-80 border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 resize-none"
                placeholder="Afgørelsesbrevet vises her når det er tilgængeligt..."
              />
            </div>

            {/* Højre: Juridisk analyse */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Juridisk analyse</h2>
                <button
                  onClick={handleUploadAnalysis}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Upload analyse (JSON)
                </button>
              </div>
              {analysisJSON ? (
                <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto h-80 border border-gray-200">
                  {JSON.stringify(analysisJSON, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-80 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-400 text-sm italic">Ingen juridisk analyse indlæst.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
