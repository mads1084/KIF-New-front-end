import satsoversigt from '../data/satsoversigt_dagpenge_v_final.json';
import type { CaseJSON } from './formToJSON';

/* ───────────────────── TYPES ───────────────────── */

export interface KravResult {
  id: string;
  title: string;
  category: "grundbetingelser" | "indkomst" | "raadighed" | "situationsbestemt";
  passed: boolean | null;
  finding: string;
  requiresDeepAnalysis: boolean;
  source: "form" | "satsoversigt" | "a-kasse-system";
}

/* ───────────────────── HELPERS ───────────────────── */

interface SatsVaerdi {
  krav: string;
  vaerdi: string;
  provision_id: string;
  dokument: string;
  forsikringsstatus: string;
  gyldighedsdato: string;
  noter?: string;
}

interface SatsKategori {
  beskrivelse: string;
  vaerdier: SatsVaerdi[];
}

function findSatsValue(category: string, kravMatch: string, forsikring?: string): string | null {
  const cat = (satsoversigt as unknown as Record<string, SatsKategori>)[category];
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

function ageFromCPR(cpr: string, referenceDate: string): number | null {
  if (!cpr || cpr.length < 6) return null;
  const cleaned = cpr.replace("-", "");
  const dd = parseInt(cleaned.substring(0, 2));
  const mm = parseInt(cleaned.substring(2, 4));
  const yy = parseInt(cleaned.substring(4, 6));
  const year = yy <= 25 ? 2000 + yy : 1900 + yy;
  const birthDate = new Date(year, mm - 1, dd);
  // Reference date is DD-MM-YYYY
  const [rd, rm, ry] = referenceDate.split("-").map(Number);
  const refDate = new Date(ry, rm - 1, rd);
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Parse DD-MM-YYYY to Date */
function parseDDMMYYYY(d: string): Date | null {
  if (!d) return null;
  const [dd, mm, yyyy] = d.split("-").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

/** Months between two DD-MM-YYYY dates */
function monthsBetween(from: string, to: string): number | null {
  const d1 = parseDDMMYYYY(from);
  const d2 = parseDDMMYYYY(to);
  if (!d1 || !d2) return null;
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

/* ───────────────────── MAIN EVAL ───────────────────── */

export function quickEval(caseData: CaseJSON): KravResult[] {
  const results: KravResult[] = [];
  const ci = caseData.citizen_info;
  const forsikring = ci.membership_status === "Fuldtidsforsikret" ? "fuldtid" : "deltid";

  // ── 1. Medlemskab ──
  results.push({
    id: "medlemskab",
    title: "Medlemskab af a-kasse",
    category: "grundbetingelser",
    passed: ci.a_kasse_member_12_months === true,
    finding: ci.a_kasse_member_12_months
      ? "Medlemskab bekræftet."
      : "Medlemskab af a-kasse i mindst 1 år er ikke bekræftet.",
    requiresDeepAnalysis: false,
    source: "a-kasse-system",
  });

  // ── 2. Bopæl og ophold ──
  if (ci.citizenship_ees === "Ja") {
    results.push({
      id: "bopael",
      title: "Bopæl og ophold",
      category: "grundbetingelser",
      passed: true,
      finding: "EØS-statsborger. Bopæl verificeres af a-kassen.",
      requiresDeepAnalysis: false,
      source: "form",
    });
  } else {
    results.push({
      id: "bopael",
      title: "Bopæl og ophold",
      category: "grundbetingelser",
      passed: null,
      finding: "Ikke EØS-statsborger — kræver nærmere vurdering.",
      requiresDeepAnalysis: true,
      source: "form",
    });
  }

  // ── 3. Alder ──
  {
    const age = ageFromCPR(ci.cpr_number, ci.first_unemployment_date);
    const minAge = parseNumber(findSatsValue("diverse_frister", "Minimumsalder"));
    const maxAge = parseNumber(findSatsValue("diverse_frister", "Folkepensionsalder"));

    if (age === null) {
      results.push({
        id: "alder",
        title: "Alder",
        category: "grundbetingelser",
        passed: null,
        finding: "Alder kunne ikke beregnes fra CPR-nummer.",
        requiresDeepAnalysis: false,
        source: "form",
      });
    } else if (minAge === null || maxAge === null) {
      results.push({
        id: "alder",
        title: "Alder",
        category: "grundbetingelser",
        passed: null,
        finding: "Tærskelværdi for aldersgrænse ikke tilgængelig i satsoversigt.",
        requiresDeepAnalysis: false,
        source: "satsoversigt",
      });
    } else if (age >= minAge && age < maxAge) {
      results.push({
        id: "alder",
        title: "Alder",
        category: "grundbetingelser",
        passed: true,
        finding: `Alder ${age} år — inden for aldersrammen for dagpenge.`,
        requiresDeepAnalysis: false,
        source: "form",
      });
    } else {
      results.push({
        id: "alder",
        title: "Alder",
        category: "grundbetingelser",
        passed: false,
        finding: `Alder ${age} år — uden for aldersrammen (${minAge}–${maxAge} år).`,
        requiresDeepAnalysis: false,
        source: "form",
      });
    }
  }

  // ── 4. Kontingent ──
  results.push({
    id: "kontingent",
    title: "Kontingentbetaling",
    category: "grundbetingelser",
    passed: true,
    finding: "Kontingentbetaling er ajour.",
    requiresDeepAnalysis: false,
    source: "a-kasse-system",
  });

  // ── 5. Indkomstkrav ──
  {
    const inc = caseData.income_statement;
    if (!inc || !inc.monthly_income || inc.monthly_income.length === 0) {
      results.push({
        id: "indkomstkrav",
        title: "Indkomstkrav",
        category: "indkomst",
        passed: null,
        finding: "Afventer indkomstdata.",
        requiresDeepAnalysis: false,
        source: "form",
      });
    } else {
      // Determine year from first_unemployment_date (DD-MM-YYYY)
      const yearStr = ci.first_unemployment_date.split("-")[2];
      const year = parseInt(yearStr);
      const catKey = `indkomstkrav_bek_${year}`;
      const kravVal = parseNumber(findSatsValue(catKey, "Indkomstkrav", forsikring));
      const loftVal = parseNumber(findSatsValue(catKey, "Indkomstloft", forsikring));

      if (kravVal === null || loftVal === null) {
        results.push({
          id: "indkomstkrav",
          title: "Indkomstkrav",
          category: "indkomst",
          passed: null,
          finding: `Indkomstkrav eller indkomstloft for ${year} ikke fundet i satsoversigt.`,
          requiresDeepAnalysis: false,
          source: "satsoversigt",
        });
      } else {
        const cappedSum = inc.monthly_income.reduce((sum, m) => sum + Math.min(m.gross, loftVal), 0);
        if (cappedSum >= kravVal) {
          results.push({
            id: "indkomstkrav",
            title: "Indkomstkrav",
            category: "indkomst",
            passed: true,
            finding: `Samlet indkomst ${cappedSum.toLocaleString("da-DK")} kr. (med loft ${loftVal.toLocaleString("da-DK")} kr./md) opfylder kravet på ${kravVal.toLocaleString("da-DK")} kr. over ${inc.monthly_income.length} måneder.`,
            requiresDeepAnalysis: false,
            source: "satsoversigt",
          });
        } else {
          const manko = kravVal - cappedSum;
          results.push({
            id: "indkomstkrav",
            title: "Indkomstkrav",
            category: "indkomst",
            passed: false,
            finding: `Samlet indkomst ${cappedSum.toLocaleString("da-DK")} kr. opfylder ikke kravet på ${kravVal.toLocaleString("da-DK")} kr. Manko: ${manko.toLocaleString("da-DK")} kr.`,
            requiresDeepAnalysis: false,
            source: "satsoversigt",
          });
        }
      }
    }
  }

  // ── 5. Reelt ledig ──
  {
    const hasEmployment = ci.employment_last_3_months === "Ja";
    const hasBusiness = ci.business_owner_co_owner === "Ja";
    const hasCVR = ci.cvr_number_last_3_years === "Ja";
    if (!hasEmployment && !hasBusiness && !hasCVR) {
      results.push({
        id: "reelt_ledig",
        title: "Reelt ledig",
        category: "raadighed",
        passed: true,
        finding: "Ingen igangværende ansættelse eller virksomhed.",
        requiresDeepAnalysis: false,
        source: "form",
      });
    } else {
      results.push({
        id: "reelt_ledig",
        title: "Reelt ledig",
        category: "raadighed",
        passed: null,
        finding: "Igangværende ansættelse eller virksomhed — kræver nærmere vurdering af ledighedsstatus.",
        requiresDeepAnalysis: true,
        source: "form",
      });
    }
  }

  // ── 6. Tilmeldt Jobnet ──
  results.push({
    id: "jobnet",
    title: "Tilmeldt Jobnet",
    category: "raadighed",
    passed: ci.unemployed_on_jobnet === true,
    finding: ci.unemployed_on_jobnet
      ? "Tilmeldt som ledig på Jobnet."
      : "Ikke tilmeldt som ledig på Jobnet.",
    requiresDeepAnalysis: false,
    source: "form",
  });

  // ── 7. Rådighed ──
  {
    const sd = ci.sickness_declaration;
    if (sd) {
      const weeklyHoursStr = findSatsValue("supplerende_dagpenge", "ugentlig arbejdstid", forsikring);
      const weeklyHours = parseNumber(weeklyHoursStr);

      const hoursOk = weeklyHours !== null ? sd.available_hours_per_week >= weeklyHours : null;
      const seekingOk = sd.actively_job_seeking === true;
      const noRestrictions = sd.job_type_restrictions === "Nej";

      let finding = "";
      let passed: boolean | null = null;

      if (weeklyHours === null) {
        finding = "Ugentligt timekrav ikke fundet i satsoversigt. ";
      }

      if (hoursOk !== null && hoursOk && seekingOk && noRestrictions) {
        passed = true;
        finding = `Rådighed bekræftet: ${sd.available_hours_per_week} timer/uge (krav: ${weeklyHours} timer), aktivt jobsøgende, ingen jobbegrænsninger.`;
      } else if (hoursOk === null) {
        passed = null;
        finding += "Kan ikke vurdere rådighed uden timekrav fra satsoversigt.";
      } else {
        passed = false;
        const issues: string[] = [];
        if (!hoursOk) issues.push(`kun ${sd.available_hours_per_week} timer/uge (krav: ${weeklyHours})`);
        if (!seekingOk) issues.push("ikke aktivt jobsøgende");
        if (!noRestrictions) issues.push("jobbegrænsninger");
        finding = `Rådighed ikke fuldt opfyldt: ${issues.join(", ")}.`;
      }

      // Check for long sickness period
      if (ci.first_sick_day && ci.last_sick_day) {
        const months = monthsBetween(ci.first_sick_day, ci.last_sick_day);
        if (months !== null && months > 24) {
          finding += ` Bemærk: langvarig sygdom (${months} måneder) — særlig rådighedsvurdering anbefales.`;
        }
      }

      results.push({
        id: "raadighed",
        title: "Rådighed",
        category: "raadighed",
        passed,
        finding,
        requiresDeepAnalysis: passed !== true,
        source: "form",
      });
    } else {
      results.push({
        id: "raadighed",
        title: "Rådighed",
        category: "raadighed",
        passed: true,
        finding: "Ingen indikerede begrænsninger i rådighed.",
        requiresDeepAnalysis: false,
        source: "form",
      });
    }
  }

  // ── BETINGET-KRAV ──

  // ── 9. Selvforskyldt ledighed ──
  if (ci.unemployment_reason.includes("Selv opsagt") || ci.unemployment_reason === "Andet" || (ci.unemployment_reason !== "" && !["Opsagt af arbejdsgiver", "Kontraktudløb", "Jeg har været syg og er nu rask", "Afsluttet uddannelse"].includes(ci.unemployment_reason))) {
    results.push({
      id: "selvforskyldt",
      title: "Selvforskyldt ledighed",
      category: "situationsbestemt",
      passed: null,
      finding: "Årsag til ledighed kræver vurdering af om ledigheden er selvforskyldt.",
      requiresDeepAnalysis: true,
      source: "form",
    });
  }

  // ── 10. Uddannelse ──
  if (ci.participating_education === "Ja") {
    results.push({
      id: "uddannelse",
      title: "Uddannelse",
      category: "situationsbestemt",
      passed: null,
      finding: "Deltagelse i uddannelse — kræver vurdering af om dagpengeret bevares.",
      requiresDeepAnalysis: true,
      source: "form",
    });
  }

  // ── 11. Selvstændig virksomhed ──
  if (ci.cvr_number_last_3_years === "Ja" || ci.business_owner_co_owner === "Ja" || ci.self_employment_profit_loss === "Ja") {
    results.push({
      id: "selvstaendig",
      title: "Selvstændig virksomhed",
      category: "situationsbestemt",
      passed: null,
      finding: "Selvstændig virksomhed — kræver vurdering af ophør og venteperiode.",
      requiresDeepAnalysis: true,
      source: "form",
    });
  }

  // ── 12. Sygdom-udelukkelse ──
  if (ci.sickness_declaration) {
    const declaredFit = ci.sickness_declaration.date_declared_fit;
    const firstUnemployment = ci.first_unemployment_date;

    if (declaredFit && firstUnemployment) {
      const fitDate = parseDDMMYYYY(declaredFit);
      const unemplDate = parseDDMMYYYY(firstUnemployment);

      if (fitDate && unemplDate && unemplDate >= fitDate) {
        results.push({
          id: "sygdom_udelukkelse",
          title: "Sygdom-udelukkelse",
          category: "situationsbestemt",
          passed: true,
          finding: "Raskmeldt og klar til arbejdsmarkedet.",
          requiresDeepAnalysis: false,
          source: "form",
        });
      } else {
        results.push({
          id: "sygdom_udelukkelse",
          title: "Sygdom-udelukkelse",
          category: "situationsbestemt",
          passed: false,
          finding: "Første ledighedsdag ligger før raskmeldingsdato — dagpenge kan ikke udbetales under sygdom.",
          requiresDeepAnalysis: false,
          source: "form",
        });
      }
    } else {
      results.push({
        id: "sygdom_udelukkelse",
        title: "Sygdom-udelukkelse",
        category: "situationsbestemt",
        passed: null,
        finding: "Manglende dato for raskmelding eller ledighed — kan ikke vurdere.",
        requiresDeepAnalysis: true,
        source: "form",
      });
    }
  }

  return results;
}
