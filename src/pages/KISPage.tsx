import React, { useState, useEffect, useRef } from "react";
import InfoTable from "../components/InfoTable";
import {
  FaFilePdf,
  FaUpload,
  FaPlay,
  FaUser,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
  FaHeartbeat,
  FaGraduationCap,
  FaBuilding,
  FaMoneyBillWave,
  FaHammer,
  FaChild,
  FaGavel,
  FaFileContract,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalMarkdownComponents } from "../styles/markdownComponents";
import { documentAnalysisService } from "../services/api";
import { DocumentAnalysis } from "../types/interfaces";

type FieldKey =
  | "cpr_number"
  | "name"
  | "phone"
  | "submitted_timestamp"
  | "unemployment_reason"
  | "first_unemployment_date"
  | "completed_6th_grade"
  | "first_sick_day"
  | "last_sick_day"
  | "employment_last_3_months"
  | "employment_ceased_last_12_months"
  | "cvr_number_last_3_years"
  | "self_employment_profit_loss"
  | "b_income_self_employment"
  | "business_owner_co_owner"
  | "worked_company_family_influence"
  | "worked_spouse_business"
  | "participating_education"
  | "unpaid_work"
  | "board_work_paid"
  | "position_paid"
  | "receives_pension"
  | "applied_disability_senior_pension"
  | "self_or_co_builder"
  | "citizenship_eea"
  | "duty_to_support_child";

interface ManualData {
  cpr_number: string;
  name: string;
  phone: string;
  submitted_timestamp: string;
  unemployment_reason: string;
  first_unemployment_date: string;
  completed_6th_grade: string;
  first_sick_day: string;
  last_sick_day: string;
  employment_last_3_months: string;
  employment_ceased_last_12_months: string;
  cvr_number_last_3_years: string;
  self_employment_profit_loss: string;
  b_income_self_employment: string;
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
  citizenship_eea: string;
  duty_to_support_child: string;
}

interface ManualOverrides {
  cpr_number: boolean;
  name: boolean;
  phone: boolean;
  submitted_timestamp: boolean;
  unemployment_reason: boolean;
  first_unemployment_date: boolean;
  completed_6th_grade: boolean;
  first_sick_day: boolean;
  last_sick_day: boolean;
  employment_last_3_months: boolean;
  employment_ceased_last_12_months: boolean;
  cvr_number_last_3_years: boolean;
  self_employment_profit_loss: boolean;
  b_income_self_employment: boolean;
  business_owner_co_owner: boolean;
  worked_company_family_influence: boolean;
  worked_spouse_business: boolean;
  participating_education: boolean;
  unpaid_work: boolean;
  board_work_paid: boolean;
  position_paid: boolean;
  receives_pension: boolean;
  applied_disability_senior_pension: boolean;
  self_or_co_builder: boolean;
  citizenship_eea: boolean;
  duty_to_support_child: boolean;
  [key: string]: boolean;
}

const ALL_FIELDS = [
  // Personal Information
  { label: "CPR-nummer", key: "cpr_number", icon: FaIdCard },
  { label: "Navn", key: "name", icon: FaUser },
  { label: "Telefon", key: "phone", icon: FaPhone },
  { label: "Ansøgning indsendt", key: "submitted_timestamp", icon: FaClock },

  // Unemployment Form - Basic
  { label: "Årsag til ledighed", key: "unemployment_reason", icon: FaBriefcase },
  { label: "Første sygedag", key: "first_sick_day", icon: FaHeartbeat },
  { label: "Sidste sygedag", key: "last_sick_day", icon: FaHeartbeat },
  { label: "Første ledighedsdag", key: "first_unemployment_date", icon: FaCalendarAlt },

  { label: "Gennemført 6. klassetrin", key: "completed_6th_grade", icon: FaGraduationCap },
  { label: "Ansættelse (seneste 3 mdr)", key: "employment_last_3_months", icon: FaBriefcase },
  { label: "Ophørt ansættelse (seneste 12 mdr)", key: "employment_ceased_last_12_months", icon: FaBriefcase },

  // Unemployment Form - Business/Self-employment
  { label: "CVR-nummer (seneste 3 år)", key: "cvr_number_last_3_years", icon: FaBuilding },
  { label: "Overskud/underskud ved selvstændig virksomhed", key: "self_employment_profit_loss", icon: FaMoneyBillWave },
  // { label: "B-indkomst (selvstændig)", key: "b_income_self_employment", icon: FaMoneyBillWave },
  { label: "Ejer/medejer af virksomhed", key: "business_owner_co_owner", icon: FaBuilding },
  { label: "Arbejdet i medindflydelse selskab", key: "worked_company_family_influence", icon: FaBuilding },
  { label: "Arbejdet i ægtefælles virksomhed", key: "worked_spouse_business", icon: FaBuilding },

  // Unemployment Form - Education/Status
  { label: "Deltager i uddannelse", key: "participating_education", icon: FaGraduationCap },

  // Unemployment Form - Other Income/Work
  { label: "Ulønnet arbejde", key: "unpaid_work", icon: FaHammer },
  { label: "Bestyrelsesarbejde (lønnet)", key: "board_work_paid", icon: FaGavel },
  { label: "Borgerligt ombud (lønnet)", key: "position_paid", icon: FaGavel },
  { label: "Modtager pension", key: "receives_pension", icon: FaMoneyBillWave },
  { label: "Førtidspension/seniorpension", key: "applied_disability_senior_pension", icon: FaMoneyBillWave },

  // Unemployment Form - Misc
  { label: "Selv- eller medbygger", key: "self_or_co_builder", icon: FaHammer },
  { label: "EØS statsborgerskab", key: "citizenship_eea", icon: FaIdCard },
  { label: "Forsørgerpligt", key: "duty_to_support_child", icon: FaChild },
] as const;

const INCOME_STATEMENT_FIELDS = [
  { label: "Optjeningsperiode start", key: "salary_date_from", icon: FaCalendarAlt },
  { label: "Optjeningsperiode slut", key: "salary_date_to", icon: FaCalendarAlt },
  { label: "Samlet justeret indkomst", key: "total_adjusted_amount", icon: FaMoneyBillWave },
  { label: "Løngrænse", key: "salary_limit", icon: FaBuilding },
  { label: "Samlet indkomst", key: "total_amount", icon: FaMoneyBillWave },
  { label: "Måneder i alt", key: "total_months", icon: FaCalendarAlt },
  { label: "Gennemsnitlig justeret md. indkomst", key: "average_monthly_adjusted_amount", icon: FaMoneyBillWave },
  { label: "Timer i alt", key: "total_hours", icon: FaClock },
  { label: "Højsats timer i alt", key: "total_high_rate_hours", icon: FaClock },
  { label: "Maks. månedlig indkomst", key: "max_monthly_amount", icon: FaMoneyBillWave },
  { label: "Min. månedlig indkomst", key: "min_monthly_amount", icon: FaMoneyBillWave },
  { label: "Antal måneder ramt af loft", key: "capped_months", icon: FaBriefcase },
] as const;

export default function KISPage() {
  const [unemploymentFile, setUnemploymentFile] = useState<File | null>(null);
  const [sicknessFile, setSicknessFile] = useState<File | null>(null);
  const [jobnetActive, setJobnetActive] = useState<boolean | null>(null);
  const [aKasseMember, setAKasseMember] = useState<boolean | null>(null);
  const [memberStatus, setMemberStatus] = useState<"Fuldtidsforsikret" | "Deltidsforsikret" | null>(
    null
  );
  // const [isExpanded, setIsExpanded] = useState(false); // Handled by InfoTable
  const [isCitizenInfoApproved, setIsCitizenInfoApproved] = useState(false);
  const [incomeStatementFile, setIncomeStatementFile] = useState<File | null>(null);
  const [firstUnemploymentDate, setFirstUnemploymentDate] = useState("");
  const [isAnalyzingIncome, setIsAnalyzingIncome] = useState(false);
  const [incomeStatementResult, setIncomeStatementResult] = useState<any | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftResult, setDraftResult] = useState<{ draft: string; citation: string } | null>(null);

  // Manual Data State
  const [manualData, setManualData] = useState<ManualData>({
    cpr_number: "",
    name: "",
    phone: "",
    submitted_timestamp: "",
    unemployment_reason: "",
    first_unemployment_date: "",
    completed_6th_grade: "",
    first_sick_day: "",
    last_sick_day: "",
    employment_last_3_months: "",
    employment_ceased_last_12_months: "",
    cvr_number_last_3_years: "",
    self_employment_profit_loss: "",
    b_income_self_employment: "",
    business_owner_co_owner: "",
    worked_company_family_influence: "",
    worked_spouse_business: "",
    participating_education: "",
    unpaid_work: "",
    board_work_paid: "",
    position_paid: "",
    receives_pension: "",
    applied_disability_senior_pension: "",
    self_or_co_builder: "",
    citizenship_eea: "",
    duty_to_support_child: "",
  });

  const [manualOverrides, setManualOverrides] = useState<ManualOverrides>({
    cpr_number: false,
    name: false,
    phone: false,
    submitted_timestamp: false,
    unemployment_reason: false,
    first_unemployment_date: false,
    completed_6th_grade: false,
    first_sick_day: false,
    last_sick_day: false,
    employment_last_3_months: false,
    employment_ceased_last_12_months: false,
    cvr_number_last_3_years: false,
    self_employment_profit_loss: false,
    b_income_self_employment: false,
    business_owner_co_owner: false,
    worked_company_family_influence: false,
    worked_spouse_business: false,
    participating_education: false,
    unpaid_work: false,
    board_work_paid: false,
    position_paid: false,
    receives_pension: false,
    applied_disability_senior_pension: false,
    self_or_co_builder: false,
    citizenship_eea: false,
    duty_to_support_child: false,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(
    null
  );

  // Sync firstUnemploymentDate with analysis result OR manual override
  useEffect(() => {
    if (manualOverrides.first_unemployment_date) {
      setFirstUnemploymentDate(manualData.first_unemployment_date || "");
    } else if (analysisResult?.metadata?.first_unemployment_date) {
      setFirstUnemploymentDate(analysisResult.metadata.first_unemployment_date);
    }
  }, [analysisResult, manualOverrides.first_unemployment_date, manualData.first_unemployment_date]);

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateCPR = (value: string): boolean => {
    // Format: DDMMYY-XXXX (6 digits, dash, 4 digits)
    const cprPattern = /^\d{6}-\d{4}$/;
    return cprPattern.test(value);
  };

  const validatePhone = (value: string): boolean => {
    // 8 digits
    const phonePattern = /^\d{8}$/;
    return phonePattern.test(value);
  };

  const validateDate = (value: string): boolean => {
    // Format: DD-MM-YYYY
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    if (!datePattern.test(value)) return false;

    // Additional validation: check if it's a valid date
    const [day, month, year] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  };

  const validateTimestamp = (value: string): boolean => {
    // Format: DD-MM-YYYY HH:MM:SS
    const timestampPattern = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    return timestampPattern.test(value);
  };

  const validateField = (key: string, value: string): string | null => {
    if (!value.trim()) return "Feltet må ikke være tomt";

    switch (key) {
      case 'cpr_number':
        return validateCPR(value) ? null : "Format: DDMMYY-XXXX (f.eks. 010190-1234)";
      case 'phone':
        return validatePhone(value) ? null : "Telefon skal være 8 cifre";
      case 'first_unemployment_date':
      case 'sick_report_date':
      case 'well_report_date':
      case 'first_sick_day':
      case 'last_sick_day':
        return validateDate(value) ? null : "Format: DD-MM-YYYY (f.eks. 23-04-2025)";
      case 'submitted_timestamp':
        return validateTimestamp(value) ? null : "Format: DD-MM-YYYY HH:MM:SS";
      default:
        return null; // No specific validation for text fields
    }
  };

  const handleFileUpload = (
    file: File | null,
    setter: (file: File | null) => void
  ) => {
    setter(file);
  };

  const getFinalData = () => {
    // Combine analysis result with manual overrides
    const baseData = analysisResult?.metadata || ({} as any);
    const result: any = {};

    (Object.keys(manualOverrides) as FieldKey[]).forEach(key => {
      result[key] = manualOverrides[key] ? manualData[key] : baseData[key];
    });

    // Add manual toggles that aren't part of overrides/metadata map directly
    result.unemployed_on_jobnet = jobnetActive;
    result.a_kasse_member_12_months = aKasseMember;
    result.membership_status = memberStatus;
    return result;
  };

  // Ref for scrolling to the bottom of the page
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reliable scroll to bottom helper — uses scrollIntoView which works
  // regardless of which container has overflow (RootLayout's <main>)
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    });
  };

  const [showCitizenResults, setShowCitizenResults] = useState(false);

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<"jobnet" | "akasse" | null>(null);

  const REJECTION_TEXTS = {
    jobnet: {
      title: "Manglende tilmelding på Jobnet",
      message: "Dagpengeansøgeren opfylder ikke kravet om at være meldt ledig på jobnet.dk og er derfor ikke berettiget til dagpenge, jf. § 62, stk. 1, nr. 1, i lovbekendtgørelse nr. 1077 af 28/08/2025 af lov om arbejdsløshedssikring – Vil du generere et udkast til afslag med denne begrundelse?",
      draftText: `**Afslag på ansøgning om dagpenge**

Du har ansøgt om dagpenge fra 23. april 2025.  

Vi må desværre give dig afslag på din ansøgning. 

Afslaget skyldes, at du ikke opfylder kravet om at være tilmeldt som ledig på jobnet.dk i lov om arbejdsløshedsforsikring mv. Begrundelsen for afslaget er uddybet nedenfor.  

**Begrundelse**

For at have ret til dagpenge skal du være tilmeldt som ledig på jobnet.dk som ”Dagpengemodtager”. 

Dette følger af kravet om at være aktivt arbejdssøgende i § 62, stk. 1, nr. 1, i lovbekendtgørelse nr. 1077 af 28/08/2025 af lov om arbejdsløshedssikring.  

Vi kan konstatere, at du ikke er tilmeldt som ledig på jobnet.dk som ”Dagpengemodtager” og derfor ikke er berettiget til dagpenge. 

Du kan finde nærmere information om tilmelding til jobnet.dk i vores trin-for-trin guide her: [LINK] 

**Klagevejledning**

Du kan klage over denne afgørelse, hvis du ikke er enig i afslaget.

Du skal sende din klage til A-kassen [INDSÆT OPLYSNINGER].

Vi skal modtage din klage senest 4 uger fra d.d.

Hvis vi fastholder afgørelsen, vil vi sende din klage til videre behandling hos Styrelsen for Arbejdsmarked og Rekruttering.  `
    },
    akasse: {
      title: "Manglende medlemskab af A-kasse",
      message: "Dagpengeansøgeren opfylder ikke kravet om at have været medlem af en a-kasse i mindst 1 år og er derfor ikke berettiget til dagpenge, jf. § 53, stk. 1, i lov om arbejdsløshedsforsikring mv. – Vil du generere et udkast til afslag med denne begrundelse?",
      draftText: `**Afslag på ansøgning om dagpenge**

Du har ansøgt om dagpenge fra 23. april 2025.

Vi må desværre give dig afslag på din ansøgning.

Afslaget skyldes, at du ikke opfylder kravet om at have været medlem af en a-kasse i mindst 1 år. Begrundelsen for afslaget er uddybet nedenfor.

**Begrundelse**

For at have ret til dagpenge skal du have været medlem af en anerkendt A-kasse i 1 år (12 måneder).

Dette følger af § 53, stk. 1, i lovbekendtgørelse nr. 1077 af 28/08/2025 af lov om arbejdsløshedssikring.

Vi kan konstatere, at du ikke har været medlem af en anerkendt A-kasse i 1 år (12 måneder) og derfor ikke er berettiget til dagpenge.

**Klagevejledning**

Du kan klage over denne afgørelse, hvis du ikke er enig i afslaget.

Du skal sende din klage til A-kassen [INDSÆT OPLYSNINGER].

Vi skal modtage din klage senest 4 uger fra d.d.

Hvis vi fastholder afgørelsen vil vi sende din klage til videre behandling hos Styrelsen for Arbejdsmarked og Rekruttering.`
    }
  };

  const handleLoadInfo = async () => {
    // Validating required fields
    if (!unemploymentFile || !sicknessFile) {
      setError("Både ledighedserklæring og sygemelding skal uploades");
      return;
    }

    if (jobnetActive === null || aKasseMember === null || memberStatus === null) {
      setError("Alle spørgsmål skal besvares");
      return;
    }

    // Reset all downstream state on every re-run
    setDraftResult(null);
    setIsCitizenInfoApproved(false);
    setIncomeStatementResult(null);
    setIncomeStatementFile(null);
    setShowCitizenResults(false);

    // Check for rejection conditions
    if (jobnetActive === false) {
      setRejectionReason("jobnet");
      setShowRejectionModal(true);
      return;
    }

    if (aKasseMember === false) {
      setRejectionReason("akasse");
      setShowRejectionModal(true);
      return;
    }

    // Validate manual inputs if any are enabled
    const hasValidationErrors = Object.keys(manualOverrides).some(key => {
      const fieldKey = key as FieldKey;
      if (manualOverrides[fieldKey] && manualData[fieldKey]) {
        const error = validateField(fieldKey, manualData[fieldKey]);
        return error !== null;
      }
      return false;
    });

    if (hasValidationErrors) {
      setError("Ret venligst valideringsfejl i manuelle felter");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const metadata = await documentAnalysisService.readCitizenInfo(
        unemploymentFile,
        sicknessFile
      );

      // Update analysisResult with the metadata
      setAnalysisResult({
        summary: "",
        decision: "",
        metadata: metadata,
      });

      setShowCitizenResults(true);
      scrollToBottom();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Der opstod en fejl under indlæsning"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRejectionConfirm = () => {
    if (rejectionReason && REJECTION_TEXTS[rejectionReason]) {
      setDraftResult({
        draft: REJECTION_TEXTS[rejectionReason].draftText,
        citation: "Automatisk afslag pga. manglende opfyldelse af grundkrav."
      });
      setShowRejectionModal(false);
      setShowCitizenResults(false);
      scrollToBottom();
    }
  };

  const RejectionModal = () => {
    if (!showRejectionModal || !rejectionReason) return null;

    const content = REJECTION_TEXTS[rejectionReason];

    return (
      <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl transform transition-all scale-100 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            {content.title}
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            {content.message}
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowRejectionModal(false)}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium border border-transparent hover:border-gray-200 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              Nej
            </button>
            <button
              onClick={handleRejectionConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 font-semibold cursor-pointer transform hover:scale-105 active:scale-95"
            >
              Ja
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleGenerateDraft = async () => {
    if (!analysisResult || !incomeStatementResult) return;

    setIsGeneratingDraft(true);
    try {
      const finalCitizenData = getFinalData();
      const result = await documentAnalysisService.generateDraft(
        finalCitizenData,
        incomeStatementResult
      );
      setDraftResult(result);
      scrollToBottom();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Der opstod en fejl under generering af udkast"
      );
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <div className="min-h-scree">
      <div className="max-w-7xl mx-auto p-6">
        {/* Introduction Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              KISagsbehandler
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload dine dokumenter for intelligent analyse og behandling af din
            KISagsbehandlersag. Systemet vil automatisk analysere dine
            dokumenter og give dig en omfattende oversigt over din sag.
          </p>
        </div>

        <RejectionModal />

        {/* Upload Section - Hidden when Rejection Confirmed */}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          {/* Same content as before, but wrapped */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Indlæs borgerens information
          </h2>

          {/* Toggles Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Toggle 1: Jobnet */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Tilmeldt som ledig på jobnet.dk
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setJobnetActive(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${jobnetActive === true
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => setJobnetActive(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${jobnetActive === false
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Toggle 2: A-kasse */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Medlem af a-kasse i 12 md.
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setAKasseMember(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${aKasseMember === true
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => setAKasseMember(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${aKasseMember === false
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Toggle 3: Member Status */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Medlemsstatus
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMemberStatus("Fuldtidsforsikret")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${memberStatus === "Fuldtidsforsikret"
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Fuldtidsforsikret
                </button>
                <button
                  onClick={() => setMemberStatus("Deltidsforsikret")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm cursor-pointer font-medium transition-colors ${memberStatus === "Deltidsforsikret"
                    ? "bg-emerald-600 text-white cursor-pointer"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-emerald-500 cursor-pointer"
                    }`}
                >
                  Deltidsforsikret
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Unemployment Form Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-500 transition-colors">
              <div className="text-center">
                <FaFilePdf className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ledighedserklæring
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload PDF af ledighedserklæringen
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files?.[0] || null,
                      setUnemploymentFile
                    )
                  }
                  className="hidden"
                  id="unemployment-upload"
                />
                <label
                  htmlFor="unemployment-upload"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  Vælg PDF
                </label>
                {unemploymentFile && (
                  <p className="text-sm text-emerald-600 mt-2">
                    {unemploymentFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Sickness Declaration Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-500 transition-colors">
              <div className="text-center">
                <FaFilePdf className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sygemelding
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload PDF af sygemeldingen
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files?.[0] || null,
                      setSicknessFile
                    )
                  }
                  className="hidden"
                  id="sickness-upload"
                />
                <label
                  htmlFor="sickness-upload"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  Vælg PDF
                </label>
                {sicknessFile && (
                  <p className="text-sm text-emerald-600 mt-2">
                    {sicknessFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Run Analysis Button */}
          <div className="text-center">
            <button
              onClick={handleLoadInfo}
              disabled={
                !unemploymentFile ||
                !sicknessFile ||
                isAnalyzing
              }
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Analyserer...
                </>
              ) : (
                <>
                  <FaPlay className="w-5 h-5 mr-3" />
                  Indlæs
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>


        {/* Results Section - Hidden initially, shown after successful Indlæs */}
        {showCitizenResults && (
          <div className="space-y-8 mb-8 animate-fade-in">
            {/* InfoTable for Citizen Info */}
            <InfoTable
              title="Borgerens Information"
              fields={ALL_FIELDS}
              data={analysisResult?.metadata || {}}
              isLoading={isAnalyzing}
              isEditable={true}
              manualData={manualData}
              manualOverrides={manualOverrides}
              onOverrideToggle={(key) =>
                setManualOverrides((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              onManualDataChange={(key, value) => {
                setManualData(prev => ({ ...prev, [key]: value }));
                const error = validateField(key, value);
                setValidationErrors(prev => ({
                  ...prev,
                  [key]: error || ''
                }));
              }}
              validationErrors={validationErrors}
              initialVisibleRows={8}
              expandLabel="Vis hele Ledighedserklæringen"
              collapseLabel="Skjul resten af Ledighedserklæringen"
            />

            {/* Approval Button - inside Borgerens Information */}
            {!isCitizenInfoApproved && (
              <div className="flex justify-center">
                <button
                  onClick={() => { setIsCitizenInfoApproved(true); scrollToBottom(); }}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Godkend borgerens information
                </button>
              </div>
            )}
          </div>
        )}

        {/* Income Statement Section - Only shown after approval */}
        {isCitizenInfoApproved && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Indlæs indkomstopgørelse
            </h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer group ${incomeStatementFile
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-300 hover:border-emerald-500 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="file"
                  id="income-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setIncomeStatementFile(file);
                  }}
                />
                <label
                  htmlFor="income-upload"
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                >
                  <FaFileContract
                    className={`w-12 h-12 mb-4 transition-colors ${incomeStatementFile ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"
                      }`}
                  />
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    {incomeStatementFile ? incomeStatementFile.name : "Upload indkomstopgørelse"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {incomeStatementFile
                      ? "Klik for at ændre fil"
                      : "Træk fil herind eller klik for at vælge (Excel)"}
                  </span>
                </label>
              </div>

              {incomeStatementFile && (
                <div className="flex justify-center mt-4">
                  <button
                    disabled={isAnalyzingIncome}
                    onClick={async () => {
                      if (!incomeStatementFile) return;
                      setIsAnalyzingIncome(true);
                      try {
                        const result = await documentAnalysisService.readIncomeStatements(
                          incomeStatementFile,
                          firstUnemploymentDate
                        );
                        console.log("Income Statement Result:", result);
                        setIncomeStatementResult(result);
                        scrollToBottom();
                      } catch (error) {
                        console.error("Error analyzing income statement:", error);
                        alert("Der opstod en fejl ved indlæsning af indkomstopgørelsen.");
                      } finally {
                        setIsAnalyzingIncome(false);
                      }
                    }}
                    className={`inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none ${isAnalyzingIncome ? "opacity-75 cursor-wait" : ""
                      }`}
                  >
                    {isAnalyzingIncome ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaPlay className="w-5 h-5 mr-3" />
                    )}
                    {isAnalyzingIncome ? " Indlæser..." : "Indlæs"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Income Statement Results Table */}
        {incomeStatementResult && (
          <div className="space-y-8 mb-8">
            <InfoTable
              title="Resultat af indkomstopgørelse"
              fields={INCOME_STATEMENT_FIELDS}
              data={incomeStatementResult}
              isEditable={false} // Read-only for now
              twoColumns={true}
            />
          </div>
        )}

        {/* Generate Draft Button */}
        {incomeStatementResult && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleGenerateDraft}
              disabled={isGeneratingDraft}
              className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all active:scale-95 cursor-pointer ${isGeneratingDraft ? "opacity-75 cursor-wait" : ""}`}
            >
              {isGeneratingDraft ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Genererer udkast...
                </>
              ) : (
                <>
                  <FaPlay className="w-5 h-5 mr-3" />
                  Lav udkast
                </>
              )}
            </button>
          </div>
        )}


        {/* Draft Results Section */}
        {draftResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileContract className="text-emerald-600" />
                Udkast til afgørelse
              </h3>
              <div className="w-full h-[800px] p-6 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent overflow-y-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={normalMarkdownComponents}
                >
                  {draftResult.draft}
                </ReactMarkdown>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaGavel className="text-emerald-600" />
                Lovhenvisninger
              </h3>
              <textarea
                value={draftResult.citation}
                readOnly
                className="w-full h-[800px] p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
