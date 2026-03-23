export interface DocumentAnalysis {
  summary: string;
  metadata: CitizenInfo;
  decision: string;
}

export interface CitizenInfo {
  cpr_number: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  submitted_timestamp?: string;
  unemployment_reason?: string;
  first_unemployment_date?: string;

  completed_6th_grade?: string;
  first_sick_day?: string;
  last_sick_day?: string;
  employment_last_3_months?: string;
  employment_ceased_last_12_months?: string;
  cvr_number_last_3_years?: string;
  self_employment_profit_loss?: string;
  b_income_self_employment?: string;
  business_owner_co_owner?: string;
  worked_company_family_influence?: string;
  worked_spouse_business?: string;
  participating_education?: string;
  unpaid_work?: string;
  board_work_paid?: string;
  position_paid?: string;
  receives_pension?: string;
  applied_disability_senior_pension?: string;
  self_or_co_builder?: string;
  citizenship_eea?: string;
  duty_to_support_child?: string;

  unemployed_on_jobnet?: boolean | null;
  a_kasse_member_12_months?: boolean | null;
  membership_status?: string | null;

  [key: string]: any; // Allow indexing
}

export interface UploadedDocument {
  file: File;
  type: "unemployment" | "sickness" | "income";
  name: string;
}

export interface AnalysisRequest {
  unemployment_document: File;
  sickness_document: File;
  income_document: File;
}

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  data: DocumentAnalysis;
}

export interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface DraftRequest {
  citizen_info: any;
  income_statement: any;
}

export interface DraftResponse {
  draft: string;
  citation: string;
}
