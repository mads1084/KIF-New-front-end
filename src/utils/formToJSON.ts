/* ───────────────────── INTERFACES ───────────────────── */

export interface SicknessDeclaration {
  date_sick_reported: string;
  date_declared_fit: string;
  available_hours_per_week: number;
  sickness_description: string;
  actively_job_seeking: boolean;
  job_search_areas: string;
  applied_health_related_benefit_during_sickness: string;
  receives_disability_insurance: string;
  job_type_restrictions: string;
}

export interface IncomeMonth {
  month: string;
  gross: number;
  hours: number;
  type?: string;
}

export interface IncomeStatement {
  source: string;
  period_from: string;
  period_to: string;
  monthly_income: IncomeMonth[];
}

export interface CitizenInfo {
  name: string;
  cpr_number: string;
  phone: string;
  submitted_timestamp: string;
  unemployment_reason: string;
  first_sick_day?: string;
  last_sick_day?: string;
  first_unemployment_date: string;
  membership_status: string;
  a_kasse_member_12_months: boolean;
  unemployed_on_jobnet: boolean;
  citizenship_ees: string;
  completed_6th_grade: string;
  duty_to_support_child: string;
  employment_last_3_months: string;
  employment_ceased_last_12_months: string;
  cvr_number_last_3_years: string;
  self_employment_profit_loss: string;
  b_income_taxed_as_self_employed: string;
  business_owner_co_owner: string;
  worked_company_family_influence: string;
  worked_spouse_business: string;
  participating_education: string;
  unpaid_work: string;
  board_work_paid: string;
  position_paid: string;
  receives_pension: string;
  applied_disability_senior_pension: string;
  self_or_co_builder: string;
  sickness_declaration?: SicknessDeclaration;
}

export interface CaseJSON {
  citizen_info: CitizenInfo;
  income_statement: IncomeStatement | null;
}

/* ───────────────────── HELPERS ───────────────────── */

/** Flip date from YYYY-MM-DD to DD-MM-YYYY */
function dateFlip(v: string): string {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${d}-${m}-${y}`;
}

/** Map "ja"/"nej" → "Ja"/"Nej" */
function jaNej(v: string | undefined): string {
  if (v === "ja") return "Ja";
  if (v === "nej") return "Nej";
  return v ?? "";
}

/** Map "ja"/"nej" → boolean */
function jaBool(v: string | undefined): boolean {
  return v === "ja";
}

/** Generate timestamp as DD-MM-YYYY HH:MM:SS */
function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/* ───────────────────── MAIN TRANSFORM ───────────────────── */

export function formToJSON(formData: Record<string, string>): CaseJSON {
  const isSygdom = formData.har_vaeret_syg === "ja";

  const unemploymentReason =
    formData.aarsag === "Andet" && formData.aarsag_andet
      ? formData.aarsag_andet
      : formData.aarsag ?? "";

  const citizenInfo: CitizenInfo = {
    name: formData.navn ?? "",
    cpr_number: formData.cpr ?? "",
    phone: formData.telefon ?? "",
    submitted_timestamp: timestamp(),
    unemployment_reason: unemploymentReason,
    first_unemployment_date: dateFlip(formData.foerste_ledig ?? ""),
    membership_status: "Fuldtidsforsikret",
    a_kasse_member_12_months: true,
    unemployed_on_jobnet: true,
    citizenship_ees: jaNej(formData.statsborger),
    completed_6th_grade: jaNej(formData.folkeskole),
    duty_to_support_child: jaNej(formData.forsoerger),
    employment_last_3_months: jaNej(formData.ansaettelse_3mdr),
    employment_ceased_last_12_months: jaNej(formData.ophoert_12mdr),
    cvr_number_last_3_years: jaNej(formData.cvr_3aar),
    self_employment_profit_loss: jaNej(formData.overskud_selvstaendig),
    b_income_taxed_as_self_employed: jaNej(formData.b_indkomst),
    business_owner_co_owner: jaNej(formData.ejer_virksomhed),
    worked_company_family_influence: jaNej(formData.selskab_indflydelse),
    worked_spouse_business: jaNej(formData.aegtefaelle_virksomhed),
    participating_education: jaNej(formData.undervisning),
    unpaid_work: jaNej(formData.uloennet),
    board_work_paid: jaNej(formData.bestyrelsesarbejde),
    position_paid: jaNej(formData.hverv),
    receives_pension: jaNej(formData.pension),
    applied_disability_senior_pension: jaNej(formData.foertidspension),
    self_or_co_builder: jaNej(formData.selvbygger),
  };

  // Sickness dates from ledighedserklæringen (opgave 1 fields)
  if (formData.aarsag === "Jeg har været syg og er nu rask") {
    citizenInfo.first_sick_day = dateFlip(formData.foerste_sygedag ?? "");
    citizenInfo.last_sick_day = dateFlip(formData.sidste_sygedag ?? "");
  }

  // Sickness declaration sub-form
  if (isSygdom) {
    citizenInfo.sickness_declaration = {
      date_sick_reported: dateFlip(formData.sygemeldt_dato ?? ""),
      date_declared_fit: dateFlip(formData.raskmeldt_dato ?? ""),
      available_hours_per_week: parseInt(formData.timer_arbejde ?? "0", 10),
      sickness_description: formData.sygdom_beskrivelse ?? "",
      actively_job_seeking: jaBool(formData.aktivt_jobsoegende),
      job_search_areas: formData.job_omraader ?? "",
      applied_health_related_benefit_during_sickness: jaNej(formData.helbredsbetinget_ydelse),
      receives_disability_insurance: jaNej(formData.erstatning_pension),
      job_type_restrictions: jaNej(formData.job_begraensninger),
    };
  }

  return {
    citizen_info: citizenInfo,
    income_statement: null,
  };
}
