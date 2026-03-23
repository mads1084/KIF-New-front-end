import { useState, useEffect, useRef } from "react";

/* ───────────────────── FORM FIELD DEFINITIONS ───────────────────── */

const LEDIGHED_SECTIONS = [
  {
    title: "Personlige oplysninger",
    fields: [
      { id: "cpr", label: "CPR-nr", type: "cpr", readonly: true },
      { id: "navn", label: "Navn", type: "text", placeholder: "Fulde navn", readonly: true },
      { id: "telefon", label: "Telefon", type: "text", placeholder: "Telefonnummer" },
    ],
  },
  {
    title: "Årsag til ledighed",
    fields: [
      {
        id: "aarsag",
        label: "Hvad er årsagen til, at du melder dig ledig?",
        type: "select",
        options: [
          "Opsagt af arbejdsgiver",
          "Selv opsagt",
          "Kontraktudløb",
          "Jeg har været syg og er nu rask",
          "Afsluttet uddannelse",
          "Andet",
        ],
      },
      {
        id: "folkeskole",
        label: "Har du gennemført 6. klassetrin i en dansk folkeskole/privatskole/friskole, eller bestået folkeskolens afsluttende prøver i 9. eller 10. klasse?",
        type: "yesno",
      },
    ],
  },
  {
    title: "Første ledighedsdato",
    fields: [
      { id: "foerste_ledig", label: "Din første dag som ledig", type: "date", hint: "Første dag som ledig er den dag, du ønsker dagpenge fra. Du kan tidligst få dagpenge fra den dag, du er tilmeldt som ledig på jobnet.dk." },
    ],
  },
  {
    title: "Seneste beskæftigelse",
    fields: [
      { id: "ansaettelse_3mdr", label: "Har du haft en ansættelse inden for de seneste 3 måneder?", type: "yesno" },
      { id: "ophoert_12mdr", label: "Er du ophørt i en ansættelse inden for de seneste 12 måneder?", type: "yesno" },
    ],
  },
  {
    title: "Selvstændig virksomhed",
    fields: [
      { id: "cvr_3aar", label: "Har du eller har du haft et CVR-nummer inden for de seneste 3 år?", type: "yesno" },
      { id: "overskud_selvstaendig", label: "Har du på nuværende tidspunkt — eller inden for de seneste 3 år — haft et overskud/underskud, der beskattes som selvstændig virksomhed?", type: "yesno" },
      { id: "b_indkomst", label: "Har du på nuværende tidspunkt — eller inden for de seneste 3 år — modtaget B-indkomst, der beskattes efter reglerne for selvstændig virksomhed?", type: "yesno" },
      { id: "ejer_virksomhed", label: "Er du ejer/medejer af en virksomhed, eller har du andre erhvervsmæssige aktiviteter?", type: "yesno" },
      { id: "selskab_indflydelse", label: "Har du inden for de seneste 3 år arbejdet i et selskab, hvor du eller din ægtefælle har haft afgørende indflydelse?", type: "yesno" },
    ],
  },
  {
    title: "Ægtefælles virksomhed",
    fields: [
      { id: "aegtefaelle_virksomhed", label: "Arbejder du eller har du arbejdet i din ægtefælles virksomhed inden for de seneste 3 år?", type: "yesno" },
    ],
  },
  {
    title: "Øvrige forhold",
    fields: [
      { id: "undervisning", label: "Deltager du i, eller er du tilmeldt undervisning?", type: "yesno" },
      { id: "uloennet", label: "Har du ulønnet arbejde?", type: "yesno" },
      { id: "bestyrelsesarbejde", label: "Har du bestyrelsesarbejde, som du får løn for?", type: "yesno" },
      { id: "hverv", label: "Har du et hverv, som du får løn for?", type: "yesno" },
    ],
  },
  {
    title: "Pension og ydelser",
    fields: [
      { id: "pension", label: "Får du udbetalt dansk eller udenlandsk pension?", type: "yesno" },
      { id: "foertidspension", label: "Får du eller har du søgt om førtidspension eller seniorpension?", type: "yesno" },
    ],
  },
  {
    title: "Øvrige oplysninger",
    fields: [
      { id: "selvbygger", label: "Er du selv- eller medbygger?", type: "yesno" },
      { id: "statsborger", label: "Er du dansk statsborger eller statsborger i et andet EØS-land?", type: "yesno" },
      { id: "forsoerger", label: "Er du forælder og forsørger til et barn under 18 år, der bor i Danmark?", type: "yesno" },
    ],
  },
];

const SYGDOM_FIELDS = [
  { id: "sygemeldt_dato", label: "Hvilken dato blev du sygemeldt?", type: "date" },
  { id: "raskmeldt_dato", label: "Hvilken dato blev du raskmeldt?", type: "date" },
  { id: "timer_arbejde", label: "Hvor mange timer er du i stand til at overtage ordinært arbejde pr. uge?", type: "text", placeholder: "f.eks. 37" },
  { id: "sygdom_beskrivelse", label: "Beskriv kort dit sygdomsforløb og om du er rask nu:", type: "textarea", placeholder: "Beskriv dit forløb..." },
  { id: "aktivt_jobsoegende", label: "Er du aktivt jobsøgende?", type: "yesno" },
  { id: "job_omraader", label: "Inden for hvilke områder søger du job?", type: "text", placeholder: "f.eks. Jura, IT, Administration" },
  { id: "helbredsbetinget_ydelse", label: "Har du søgt om en helbredsbetinget ydelse, mens du var sygemeldt?", type: "yesno" },
  { id: "erstatning_pension", label: "Får du udbetalt erstatning, pension eller anden ydelse, der knytter sig til tab af erhvervsevne?", type: "yesno" },
  { id: "job_begraensninger", label: "Er du omfattet af begrænsninger ift. visse typer af job?", type: "yesno" },
];

/* ───────────────────── PREFILLED TEST DATA ───────────────────── */

const PREFILL_DATA = {
  cpr: "040984-2623", navn: "Mathias Bell Willumsen", telefon: "26206409",
  aarsag: "Jeg har været syg og er nu rask", folkeskole: "ja",
  foerste_ledig: "2025-04-23",
  ansaettelse_3mdr: "nej", ophoert_12mdr: "nej",
  cvr_3aar: "nej", overskud_selvstaendig: "nej", b_indkomst: "nej",
  ejer_virksomhed: "nej", selskab_indflydelse: "nej", aegtefaelle_virksomhed: "nej",
  undervisning: "nej", uloennet: "nej", bestyrelsesarbejde: "nej", hverv: "nej",
  pension: "nej", foertidspension: "nej",
  selvbygger: "nej", statsborger: "ja", forsoerger: "ja",
  sygemeldt_dato: "2022-03-14", raskmeldt_dato: "2025-04-23",
  timer_arbejde: "37", sygdom_beskrivelse: "Jeg fik en svær depression i marts 2022 og har været i behandling siden. Jeg er rask nu (raskmeldt hos kommunen pr. 23/4-2025) og i gang med nedtrapning af antidepressiv medicin.",
  aktivt_jobsoegende: "ja", job_omraader: "Jura",
  helbredsbetinget_ydelse: "nej", erstatning_pension: "ja", job_begraensninger: "nej",
  har_vaeret_syg: "ja",
};

/* ───────────────────── ASSESSMENT KRAV ───────────────────── */

const KRAV = [
  {
    id: 1, title: "Medlemskab af a-kasse",
    detailPassed: { verdict: "Opfyldt", finding: "Medlemskabskrav opfyldt — ansøger har tilstrækkelig anciennitet.", legalRef: "Lov om arbejdsløshedsforsikring m.v. — medlemskabskrav" },
    passed: true, durationMs: 2200,
  },
  {
    id: 2, title: "Indkomst- og beskæftigelseskrav",
    detailPassed: { verdict: "Opfyldt", finding: "Indkomstdata hentet fra eIndkomst. Samlet indkomst i opgørelsesperioden overstiger minimumskravet.", legalRef: "Bekendtgørelse om indkomst- og beskæftigelseskravet" },
    passed: true, durationMs: 3400,
  },
  {
    id: 3, title: "Tilmeldt som ledig hos Jobcenter",
    detailPassed: { verdict: "Opfyldt", finding: "Tilmeldingsstatus verificeret via Jobnet.", legalRef: "Lov om en aktiv beskæftigelsesindsats — tilmeldingskrav" },
    passed: true, durationMs: 1800,
  },
  {
    id: 4, title: "Rådighed for arbejdsmarkedet",
    detailPassed: { verdict: "Opfyldt", finding: "Ansøger er raskmeldt og bekræfter rådighed for 37 timer/uge. Aktivt jobsøgende inden for jura.", legalRef: "Bekendtgørelse om rådighed" },
    passed: true, durationMs: 2600,
  },
  {
    id: 5, title: "Ophørsårsag og karantæne",
    detailPassed: { verdict: "Opfyldt", finding: "Ansøger overgår fra sygedagpenge. Ikke selvforskyldt — ingen karantæne.", legalRef: "Bekendtgørelse om selvforskyldt ledighed" },
    passed: true, durationMs: 3000,
  },
  {
    id: 6, title: "Sygdomsforløb og raskmelding",
    detailPassed: { verdict: "Opfyldt", finding: "Raskmeldt pr. 23-04-2025. Fuld erhvervsevne (37 timer). Bemærk: ansøger modtager ydelse vedr. tab af erhvervsevne — kræver nærmere vurdering.", legalRef: "Bekendtgørelse om rådighed — raskmeldte" },
    passed: true, durationMs: 3200,
  },
  {
    id: 7, title: "Karensperiode og ventedage",
    detailPassed: { verdict: "Opfyldt", finding: "Ventedage beregnet. Ingen yderligere karensperiode pålagt.", legalRef: "Lov om arbejdsløshedsforsikring — karens og ventedage" },
    passed: true, durationMs: 2000,
  },
];

const STATUS = { PENDING: "pending", ACTIVE: "active", DONE: "done" };

/* ───────────────────── ICONS ───────────────────── */

function CheckIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#1a6b4a" /><path d="M6.5 11.5l3 3 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function CrossIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#c0392b" /><path d="M7.5 7.5l7 7M14.5 7.5l-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>);
}
function SpinnerIcon({ size = 22 }) {
  return (<svg width={size} height={size} viewBox="0 0 22 22" fill="none" className="spin"><circle cx="11" cy="11" r="9" stroke="#e0e4ea" strokeWidth="2.5" /><path d="M11 2a9 9 0 0 1 9 9" stroke="#1a6b4a" strokeWidth="2.5" strokeLinecap="round" /></svg>);
}
function PendingDot() {
  return (<svg width={22} height={22} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="#d0d5dd" strokeWidth="2" fill="none" /></svg>);
}

/* ───────────────────── FORM FIELD COMPONENT ───────────────────── */

function FormField({ field, value, onChange, showCpr, onToggleCpr, error }) {
  const base = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    border: error ? "2px solid #dc2626" : "1px solid #d0d5dd", borderRadius: 8, color: "#1d2939",
    backgroundColor: "#fff", outline: "none", transition: "border-color 0.2s",
  };
  const errAsterisk = error ? (
    <span style={{ position: "absolute", top: 0, right: 0, color: "#dc2626", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>*</span>
  ) : null;

  if (field.type === "cpr") {
    const masked = value ? value.replace(/(\d{6}-)\d{4}/, "$1****") : "";
    return (
      <div style={{ marginBottom: 16, position: "relative" }}>
        <label style={{ display: "block", fontSize: 13.5, color: "#344054", marginBottom: 6, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="text" value={showCpr ? (value || "") : masked} readOnly
            style={{ ...base, backgroundColor: "#f3f4f6", color: "#667085", cursor: "default", flex: 1, fontVariantNumeric: "tabular-nums", border: "1px solid #d0d5dd" }} />
          <button onClick={onToggleCpr} type="button" style={{
            padding: "10px 14px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            color: "#1a6b4a", backgroundColor: "#fff", border: "1px solid #d0d5dd", borderRadius: 8,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>{showCpr ? "Skjul" : "Vis CPR-nr"}</button>
        </div>
        <span style={{ fontSize: 11, color: "#98a2b3", fontFamily: "'DM Sans', sans-serif" }}>Hentet fra medlemsoplysninger</span>
      </div>
    );
  }

  if (field.type === "yesno") {
    return (
      <div style={{ marginBottom: 16, position: "relative" }} data-field-error={error ? "true" : undefined}>
        {errAsterisk}
        <label style={{ display: "block", fontSize: 13.5, color: "#344054", marginBottom: 8, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["ja", "nej"].map((opt) => (
            <button key={opt} onClick={() => onChange(field.id, opt)} style={{
              padding: "8px 24px", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              border: value === opt ? "2px solid #1a6b4a" : error ? "2px solid #dc2626" : "1px solid #d0d5dd",
              borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              backgroundColor: value === opt ? "#eef7f2" : "#fff",
              color: value === opt ? "#1a6b4a" : "#667085",
            }}>{opt === "ja" ? "Ja" : "Nej"}</button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div style={{ marginBottom: 16, position: "relative" }} data-field-error={error ? "true" : undefined}>
        {errAsterisk}
        <label style={{ display: "block", fontSize: 13.5, color: "#344054", marginBottom: 6, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
        <select value={value || ""} onChange={(e) => onChange(field.id, e.target.value)} style={{ ...base, appearance: "auto", cursor: "pointer" }}>
          <option value="">Vælg...</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div style={{ marginBottom: 16, position: "relative" }} data-field-error={error ? "true" : undefined}>
        {errAsterisk}
        <label style={{ display: "block", fontSize: 13.5, color: "#344054", marginBottom: 6, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
        <textarea value={value || ""} onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || ""} rows={4}
          style={{ ...base, resize: "vertical", lineHeight: 1.5 }}
          onFocus={(e) => e.target.style.borderColor = error ? "#dc2626" : "#1a6b4a"}
          onBlur={(e) => e.target.style.borderColor = error ? "#dc2626" : "#d0d5dd"} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16, position: "relative" }} data-field-error={error ? "true" : undefined}>
      {errAsterisk}
      <label style={{ display: "block", fontSize: 13.5, color: "#344054", marginBottom: 6, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>{field.label}</label>
      {field.hint && <p style={{ margin: "0 0 6px", fontSize: 12, color: "#667085", fontStyle: "italic" }}>{field.hint}</p>}
      <input type={field.type === "date" ? "date" : "text"} value={value || ""}
        onChange={(e) => !field.readonly && onChange(field.id, e.target.value)}
        readOnly={!!field.readonly}
        placeholder={field.placeholder || ""}
        style={{ ...base, ...(field.type === "date" ? { maxWidth: 220 } : {}), ...(field.readonly ? { backgroundColor: "#f3f4f6", color: "#667085", cursor: "default", border: "1px solid #d0d5dd" } : {}) }}
        onFocus={(e) => !field.readonly && (e.target.style.borderColor = error ? "#dc2626" : "#1a6b4a")}
        onBlur={(e) => e.target.style.borderColor = (error && !field.readonly) ? "#dc2626" : "#d0d5dd"} />
      {field.readonly && <span style={{ fontSize: 11, color: "#98a2b3", fontFamily: "'DM Sans', sans-serif" }}>Hentet fra medlemsoplysninger</span>}
    </div>
  );
}

/* ───────────────────── STEP NODE ───────────────────── */

function StepNode({ krav, status, isLast, expanded, onToggle }) {
  const detail = krav.detailPassed;
  const passed = krav.passed;
  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
        <div style={{ transition: "all 0.4s ease" }}>
          {status === STATUS.DONE ? (passed ? <CheckIcon /> : <CrossIcon />) : status === STATUS.ACTIVE ? <SpinnerIcon /> : <PendingDot />}
        </div>
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 40,
            backgroundColor: status === STATUS.DONE ? "#1a6b4a" : "#e5e7eb",
            transition: "background-color 0.6s ease",
          }} />
        )}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
        <h3 style={{
          margin: 0, fontSize: 16, fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600,
          color: status === STATUS.PENDING ? "#98a2b3" : "#1d2939", transition: "color 0.4s",
        }}>{krav.title}</h3>
        <p style={{
          margin: "4px 0 0", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
          color: status === STATUS.PENDING ? "#b0b8c4" : "#475467", transition: "color 0.3s",
        }}>
          {status === STATUS.ACTIVE ? "Analyserer..." : status === STATUS.DONE ? (passed ? `${krav.title} er vurderet og godkendt` : `${krav.title} — ikke opfyldt`) : "Afventer"}
        </p>
        {status === STATUS.DONE && (
          <button onClick={onToggle} style={{
            marginTop: 8, padding: "5px 14px", fontSize: 12.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            color: "#1a6b4a", backgroundColor: expanded ? "#eef7f2" : "transparent",
            border: "1px solid #1a6b4a", borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
          }}>{expanded ? "Skjul detaljer" : "Klik for flere detaljer"}</button>
        )}
        {expanded && status === STATUS.DONE && detail && (
          <div style={{
            marginTop: 10, padding: "14px 18px", backgroundColor: passed ? "#f6faf8" : "#fdf4f3",
            borderLeft: `3px solid ${passed ? "#1a6b4a" : "#c0392b"}`, borderRadius: "0 8px 8px 0", animation: "fadeSlide 0.3s ease",
          }}>
            <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#344054", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: passed ? "#1a6b4a" : "#c0392b" }}>{detail.verdict}</div>
              <div>{detail.finding}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#667085", fontStyle: "italic" }}>Juridisk reference: {detail.legalRef}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── DECISION SECTION ───────────────────── */

function DecisionSection({ visible, formData }) {
  if (!visible) return null;
  const name = formData.navn || "Ansøger";
  return (
    <div style={{ animation: "fadeSlide 0.6s ease", marginTop: 20 }}>
      <div style={{ padding: "28px 32px", backgroundColor: "#f6faf8", border: "2px solid #1a6b4a", borderRadius: 12 }}>
        <div style={{
          display: "inline-block", padding: "4px 14px", backgroundColor: "#1a6b4a", color: "#fff",
          borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          marginBottom: 16, letterSpacing: "0.02em",
        }}>GODKENDT</div>
        <h2 style={{ margin: "0 0 16px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1d2939" }}>
          Afgørelse om ret til dagpenge
        </h2>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, color: "#344054", lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 12px" }}>Kære {name},</p>
          <p style={{ margin: "0 0 12px" }}>
            På baggrund af de indsendte oplysninger og den automatiske vurdering af dine forhold,
            er det konstateret, at du opfylder betingelserne for ret til dagpenge.
          </p>
          <p style={{ margin: "0 0 12px" }}>
            Alle krav er gennemgået og fundet opfyldt. Din dagpengeret er vurderet gældende
            fra den {formData.foerste_ledig ? new Date(formData.foerste_ledig).toLocaleDateString("da-DK") : "—"}.
          </p>
          <p style={{ margin: 0, fontWeight: 500 }}>Med venlig hilsen,<br />Dagpengeafdelingen</p>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: "20px 24px", backgroundColor: "#fffbeb", border: "1px solid #f5c542", borderRadius: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>⚖️</span>
          <div>
            <h4 style={{ margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 700, color: "#92400e" }}>
              Vigtigt — automatisk afgørelse (EU AI Act)
            </h4>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#78350f", lineHeight: 1.55 }}>
              Denne vurdering er foretaget af et automatisk system og er illustrativ og ikke bindende.
              Afgørelsen sendes til endelig gennemgang af en sagsbehandler, som træffer den endelige beslutning.
              Du har til enhver tid ret til menneskelig behandling af din sag.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button style={{
          padding: "12px 28px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          color: "#fff", backgroundColor: "#1a6b4a", border: "none", borderRadius: 8, cursor: "pointer",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
          onMouseOver={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 12px rgba(26,107,74,0.3)"; }}
          onMouseOut={(e) => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>
          Acceptér automatisk afgørelse
        </button>
        <button style={{
          padding: "12px 28px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          color: "#344054", backgroundColor: "#fff", border: "1px solid #d0d5dd", borderRadius: 8, cursor: "pointer",
        }}>Anmod om manuel gennemgang</button>
      </div>
    </div>
  );
}

/* ───────────────────── APPLICATION FORM DIALOG ───────────────────── */

function ApplicationDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    cpr: "040984-2623",
    navn: "Mathias Bell Willumsen",
    telefon: "26206409",
  });
  const [showSygdom, setShowSygdom] = useState(false);
  const [sygdomSaved, setSygdomSaved] = useState(false);
  const [bekraeftet, setBekraeftet] = useState(false);
  const [showFormCpr, setShowFormCpr] = useState(false);
  const [page, setPage] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sygdomValidateAttempted, setSygdomValidateAttempted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const bodyRef = useRef(null);

  const set = (id, val) => {
    setFormData((p) => ({ ...p, [id]: val }));
    if (id === "har_vaeret_syg") {
      setShowSygdom(val === "ja");
      if (val === "nej") { setSygdomSaved(false); setSygdomValidateAttempted(false); }
    }
  };

  // Collect all required ledighed field IDs
  const getLedighedRequiredIds = () => {
    const ids = [];
    LEDIGHED_SECTIONS.forEach((s) => {
      s.fields.forEach((f) => {
        if (!f.readonly) ids.push(f.id);
      });
    });
    ids.push("har_vaeret_syg");
    if (formData.aarsag === "Andet") ids.push("aarsag_andet");
    return ids;
  };

  const getSygdomRequiredIds = () => SYGDOM_FIELDS.map((f) => f.id);

  const isEmpty = (id) => !formData[id] || (typeof formData[id] === "string" && formData[id].trim() === "");

  const getMissingLedighed = () => getLedighedRequiredIds().filter(isEmpty);
  const getMissingSygdom = () => getSygdomRequiredIds().filter(isEmpty);

  const hasSygdomErrors = showSygdom && getMissingSygdom().length > 0;

  const prefill = () => {
    setFormData(PREFILL_DATA);
    setShowSygdom(PREFILL_DATA.har_vaeret_syg === "ja");
    setSygdomSaved(true);
    setBekraeftet(true);
    setSubmitAttempted(false);
    setSygdomValidateAttempted(false);
    setShowConfirm(false);
  };

  const clearForm = () => {
    setFormData({ cpr: "040984-2623", navn: "Mathias Bell Willumsen", telefon: "26206409" });
    setShowSygdom(false);
    setSygdomSaved(false);
    setBekraeftet(false);
    setPage(0);
    setSubmitAttempted(false);
    setSygdomValidateAttempted(false);
    setShowConfirm(false);
  };

  const handleSubmitClick = () => {
    setSubmitAttempted(true);
    if (showSygdom) setSygdomValidateAttempted(true);

    const missingMain = getMissingLedighed();
    const missingSyg = showSygdom ? getMissingSygdom() : [];
    const allOk = missingMain.length === 0 && missingSyg.length === 0 && bekraeftet && (!showSygdom || sygdomSaved);

    if (!allOk) {
      // Wait for React re-render, then scroll to first error
      setTimeout(() => {
        if (bodyRef.current) {
          const firstErr = bodyRef.current.querySelector('[data-field-error="true"]');
          if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
      return;
    }
    setShowConfirm(true);
  };

  const handleSygdomSave = () => {
    setSygdomSaved(true);
    setPage(0);
  };

  const isFieldError = (id, context) => {
    if (context === "sygdom") return sygdomValidateAttempted && isEmpty(id);
    return submitAttempted && isEmpty(id);
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
      animation: "fadeIn 0.25s ease",
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, maxWidth: 640, width: "100%",
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, color: "#1d2939" }}>
              {page === 0 ? "Ledighedserklæring" : "Erklæring om rådighed efter sygdom"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#667085", fontFamily: "'DM Sans', sans-serif" }}>
              {page === 0 ? "Udfyld dine oplysninger for at starte dagpengevurderingen" : "Oplysninger om dit sygdomsforløb"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#98a2b3",
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6,
          }}>×</button>
        </div>

        {/* Body */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {page === 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button onClick={prefill} style={{
                flex: 1, padding: "8px 16px", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, color: "#667085", backgroundColor: "#f3f4f6", border: "1px dashed #d0d5dd",
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseOver={(e) => { e.target.style.backgroundColor = "#eef7f2"; e.target.style.color = "#1a6b4a"; e.target.style.borderColor = "#1a6b4a"; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = "#f3f4f6"; e.target.style.color = "#667085"; e.target.style.borderColor = "#d0d5dd"; }}>
                Demo: Udfyld med testdata
              </button>
              <button onClick={clearForm} style={{
                padding: "8px 16px", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, color: "#c0392b", backgroundColor: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseOver={(e) => { e.target.style.backgroundColor = "#fdf4f3"; e.target.style.borderColor = "#c0392b"; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = "#fff"; e.target.style.borderColor = "#e5e7eb"; }}>
                Ryd
              </button>
            </div>
          )}

          {page === 0 && (
            <>
              {LEDIGHED_SECTIONS.map((section) => (
                <div key={section.title} style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                    color: "#1a6b4a", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #e5e7eb",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>{section.title}</h3>
                  {section.fields.map((f) => (
                    <FormField key={f.id} field={f} value={formData[f.id]} onChange={set}
                      showCpr={showFormCpr} onToggleCpr={() => setShowFormCpr(p => !p)}
                      error={!f.readonly && isFieldError(f.id, "main")} />
                  ))}
                  {/* "Andet" fritekst trigger */}
                  {section.title === "Årsag til ledighed" && formData.aarsag === "Andet" && (
                    <FormField
                      field={{ id: "aarsag_andet", label: "Beskriv årsagen til din ledighed:", type: "textarea", placeholder: "Beskriv din situation..." }}
                      value={formData.aarsag_andet} onChange={set}
                      error={isFieldError("aarsag_andet", "main")} />
                  )}
                </div>
              ))}

              {/* Sygdom trigger */}
              <div data-field-error={(submitAttempted && showSygdom && (!sygdomSaved || hasSygdomErrors)) ? "true" : undefined}
                style={{ marginBottom: 24, padding: "18px 20px", backgroundColor: "#fef9ee", border: "1px solid #f5dfa0", borderRadius: 10 }}>
                <FormField
                  field={{ id: "har_vaeret_syg", label: "Har du været sygemeldt inden for de seneste 3 år?", type: "yesno" }}
                  value={formData.har_vaeret_syg} onChange={set}
                  error={isFieldError("har_vaeret_syg", "main")}
                />
                {showSygdom && !sygdomSaved && (
                  <button onClick={() => setPage(1)} style={{
                    marginTop: 4, padding: "10px 20px", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                    color: "#92400e", backgroundColor: "#fff",
                    border: submitAttempted ? "2px solid #dc2626" : "1px solid #f5c542",
                    borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#fffbeb"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#fff"}>
                    Udfyld erklæring om rådighed efter sygdom →
                  </button>
                )}
                {showSygdom && sygdomSaved && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {(!submitAttempted || !hasSygdomErrors) ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#1a6b4a" /><path d="M5.5 9.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#1a6b4a" }}>
                          Erklæring om rådighed efter sygdom — Gemt
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "#dc2626", fontSize: 16 }}>⚠</span>
                        <span style={{ fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#dc2626" }}>
                          Erklæring om rådighed efter sygdom — mangler felter
                        </span>
                      </>
                    )}
                    <button onClick={() => { setSygdomValidateAttempted(true); setPage(1); }} style={{
                      marginLeft: 8, padding: "4px 12px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                      color: (submitAttempted && hasSygdomErrors) ? "#dc2626" : "#667085",
                      backgroundColor: "transparent",
                      border: (submitAttempted && hasSygdomErrors) ? "2px solid #dc2626" : "1px solid #d0d5dd",
                      borderRadius: 6, cursor: "pointer",
                    }}>Redigér</button>
                  </div>
                )}
              </div>

              {/* Erklæring med obligatorisk checkbox */}
              <div style={{
                padding: "16px 20px", borderRadius: 10,
                backgroundColor: (submitAttempted && !bekraeftet) ? "#fef2f2" : "#f9fafb",
                border: (submitAttempted && !bekraeftet) ? "2px solid #dc2626" : "1px solid #e5e7eb",
                position: "relative",
              }} data-field-error={submitAttempted && !bekraeftet ? "true" : undefined}>
                {submitAttempted && !bekraeftet && (
                  <span style={{ position: "absolute", top: 6, right: 10, color: "#dc2626", fontSize: 16, fontWeight: 700 }}>*</span>
                )}
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={bekraeftet} onChange={(e) => setBekraeftet(e.target.checked)}
                    style={{ marginTop: 2, width: 18, height: 18, accentColor: "#1a6b4a", cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#475467", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>
                    Jeg bekræfter, at de oplysninger, jeg har givet i ledighedserklæringen, er rigtige, og jeg har læst vejledningen.
                  </span>
                </label>
              </div>
            </>
          )}

          {page === 1 && (
            <>
              {SYGDOM_FIELDS.map((f) => (
                <FormField key={f.id} field={f} value={formData[f.id]} onChange={set}
                  error={isFieldError(f.id, "sygdom")} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px", borderTop: "1px solid #e5e7eb", flexShrink: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {page === 1 ? (
            <>
              <button onClick={() => setPage(0)} style={{
                padding: "10px 22px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                color: "#344054", backgroundColor: "#fff", border: "1px solid #d0d5dd", borderRadius: 8, cursor: "pointer",
              }}>← Tilbage</button>
              <button onClick={handleSygdomSave} style={{
                padding: "10px 22px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                color: "#fff", backgroundColor: "#1a6b4a", border: "none", borderRadius: 8, cursor: "pointer",
              }}>Gem og gå tilbage</button>
            </>
          ) : (
            <>
              <button onClick={onClose} style={{
                padding: "10px 22px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                color: "#667085", backgroundColor: "transparent", border: "1px solid #d0d5dd", borderRadius: 8, cursor: "pointer",
              }}>Annullér</button>
              <button onClick={handleSubmitClick} style={{
                padding: "12px 28px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                color: "#fff", backgroundColor: "#1a6b4a", border: "none", borderRadius: 8, cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 2px 8px rgba(26,107,74,0.2)",
              }}
                onMouseOver={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(26,107,74,0.3)"; }}
                onMouseOut={(e) => { e.target.style.transform = ""; e.target.style.boxShadow = "0 2px 8px rgba(26,107,74,0.2)"; }}>
                Indsend ansøgning
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div style={{
          position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 16, zIndex: 10, animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            backgroundColor: "#fff", borderRadius: 14, maxWidth: 420, width: "90%",
            padding: "28px 28px 24px", boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            animation: "fadeSlide 0.25s ease",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>📨</div>
            <h3 style={{
              margin: "0 0 12px", fontSize: 18, fontFamily: "'Source Serif 4', Georgia, serif",
              fontWeight: 700, color: "#1d2939", textAlign: "center",
            }}>Indsend ansøgning?</h3>
            <p style={{
              margin: "0 0 24px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
              color: "#475467", lineHeight: 1.6, textAlign: "center",
            }}>
              Du er ved at indsende din ansøgning om dagpenge. Når ansøgningen er indsendt, kan den ikke ændres.
              Sørg for, at alle oplysninger er korrekte inden du fortsætter.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowConfirm(false); onSubmit(formData); }} style={{
                padding: "12px 24px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                color: "#fff", backgroundColor: "#1a6b4a", border: "none", borderRadius: 8, cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseOver={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 4px 12px rgba(26,107,74,0.3)"; }}
                onMouseOut={(e) => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>
                Ja, indsend min ansøgning
              </button>
              <button onClick={() => setShowConfirm(false)} style={{
                padding: "12px 24px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                color: "#344054", backgroundColor: "#fff", border: "1px solid #d0d5dd", borderRadius: 8, cursor: "pointer",
              }}>
                Nej, jeg vil gerne ændre mine oplysninger
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ───────────────────── MAIN COMPONENT ───────────────────── */

export default function KIFAssessment() {
  const [phase, setPhase] = useState("landing");
  const [formData, setFormData] = useState({});
  const [showCpr, setShowCpr] = useState(false);
  const [stepStatuses, setStepStatuses] = useState(KRAV.map(() => STATUS.PENDING));
  const [expanded, setExpanded] = useState({});
  const [currentStep, setCurrentStep] = useState(-1);
  const decisionRef = useRef(null);
  const stepRefs = useRef([]);

  const openForm = () => setPhase("form");
  const closeForm = () => setPhase("landing");

  const submitForm = (data) => {
    setFormData(data);
    setPhase("assessment");
    setStepStatuses(KRAV.map(() => STATUS.PENDING));
    setExpanded({});
    setCurrentStep(0);
  };

  const reset = () => {
    setPhase("landing");
    setFormData({});
    setStepStatuses(KRAV.map(() => STATUS.PENDING));
    setExpanded({});
    setCurrentStep(-1);
  };

  useEffect(() => {
    if (phase !== "assessment" || currentStep < 0 || currentStep >= KRAV.length) return;
    setStepStatuses((prev) => { const n = [...prev]; n[currentStep] = STATUS.ACTIVE; return n; });
    setTimeout(() => { stepRefs.current[currentStep]?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200);
    const timer = setTimeout(() => {
      setStepStatuses((prev) => { const n = [...prev]; n[currentStep] = STATUS.DONE; return n; });
      if (currentStep < KRAV.length - 1) {
        setTimeout(() => setCurrentStep((s) => s + 1), 400);
      } else {
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => { decisionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200);
        }, 600);
      }
    }, KRAV[currentStep].durationMs);
    return () => clearTimeout(timer);
  }, [currentStep, phase]);

  const showSteps = phase === "assessment" || phase === "done";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px 60px", fontFamily: "'DM Sans', sans-serif", color: "#1d2939" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, backgroundColor: "#1a6b4a", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 18,
          }}>K</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Source Serif 4', Georgia, serif" }}>KIF</div>
            <div style={{ fontSize: 11.5, color: "#667085", letterSpacing: "0.04em", textTransform: "uppercase" }}>Dagpengevurdering</div>
          </div>
        </div>

        {/* Stamdata after form submit */}
        {showSteps && formData.navn && (
          <div style={{
            padding: "18px 22px", backgroundColor: "#f9fafb", borderRadius: 10,
            border: "1px solid #e5e7eb", marginBottom: 24, animation: "fadeSlide 0.4s ease",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px", fontSize: 13.5 }}>
              <div>
                <span style={{ color: "#667085", fontSize: 12 }}>Ansøger</span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.navn}</div>
              </div>
              <div>
                <span style={{ color: "#667085", fontSize: 12 }}>CPR</span>
                <div style={{ fontWeight: 600, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{formData.cpr}</div>
              </div>
              <div>
                <span style={{ color: "#667085", fontSize: 12 }}>Ledighedsårsag</span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.aarsag}</div>
              </div>
              <div>
                <span style={{ color: "#667085", fontSize: 12 }}>Første ledighedsdag</span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.foerste_ledig ? new Date(formData.foerste_ledig).toLocaleDateString("da-DK") : "—"}</div>
              </div>
              {formData.har_vaeret_syg === "ja" && (
                <>
                  <div>
                    <span style={{ color: "#667085", fontSize: 12 }}>Sygemeldt</span>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.sygemeldt_dato ? new Date(formData.sygemeldt_dato).toLocaleDateString("da-DK") : "—"}</div>
                  </div>
                  <div>
                    <span style={{ color: "#667085", fontSize: 12 }}>Raskmeldt</span>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.raskmeldt_dato ? new Date(formData.raskmeldt_dato).toLocaleDateString("da-DK") : "—"}</div>
                  </div>
                </>
              )}
              <div>
                <span style={{ color: "#667085", fontSize: 12 }}>Forsørgerpligt</span>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{formData.forsoerger === "ja" ? "Ja" : "Nej"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Landing */}
        {phase === "landing" && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            {/* Stamdata from a-kasse membership */}
            <div style={{
              padding: "18px 22px", backgroundColor: "#f9fafb", borderRadius: 10,
              border: "1px solid #e5e7eb", marginBottom: 28,
            }}>
              <div style={{ fontSize: 11.5, color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, fontWeight: 600 }}>
                Medlemsoplysninger hentet fra a-kassen
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px", fontSize: 13.5 }}>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>Ansøger</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>Mathias Bell Willumsen</div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>CPR-nr</span>
                  <div style={{ fontWeight: 600, marginTop: 2, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{showCpr ? "040984-2623" : "040984-****"}</span>
                    <button onClick={() => setShowCpr(p => !p)} style={{
                      fontSize: 11, color: "#1a6b4a", background: "none", border: "1px solid #d0d5dd",
                      borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>{showCpr ? "Skjul" : "Vis CPR-nr"}</button>
                  </div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>Adresse</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>Skovvej 12, 8000 Aarhus C</div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>Telefon</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>26 20 64 09</div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>E-mail</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>mathias@example.dk</div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>Medlemsstatus</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>Fuldtidsforsikret</div>
                </div>
                <div>
                  <span style={{ color: "#667085", fontSize: 12 }}>Medlem siden</span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>15-03-2018</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 26, fontWeight: 700, margin: "0 0 12px", color: "#1d2939" }}>
                Ansøgning om dagpenge
              </h2>
              <p style={{ fontSize: 15, color: "#667085", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
                Start din ansøgning ved at udfylde ledighedserklæringen. Systemet vurderer automatisk dine dagpengerettigheder.
              </p>
              <button onClick={openForm} style={{
                padding: "14px 36px", fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                color: "#fff", backgroundColor: "#1a6b4a", border: "none", borderRadius: 10, cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 2px 8px rgba(26,107,74,0.2)",
              }}
                onMouseOver={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(26,107,74,0.3)"; }}
                onMouseOut={(e) => { e.target.style.transform = ""; e.target.style.boxShadow = "0 2px 8px rgba(26,107,74,0.2)"; }}>
                Start ansøgning
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {showSteps && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#667085" }}>
                {phase === "done" ? "Alle krav vurderet" : `Vurderer krav ${currentStep + 1} af ${KRAV.length}...`}
              </span>
              {phase === "done" && (
                <button onClick={reset} style={{
                  fontSize: 12, color: "#667085", background: "none", border: "1px solid #d0d5dd",
                  borderRadius: 6, padding: "4px 12px", cursor: "pointer",
                }}>Ny ansøgning</button>
              )}
            </div>
            <div style={{ height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, backgroundColor: "#1a6b4a", transition: "width 0.5s ease",
                width: `${phase === "done" ? 100 : (stepStatuses.filter(s => s === STATUS.DONE).length / KRAV.length) * 100}%`,
              }} />
            </div>
          </div>
        )}

        {/* Steps */}
        {showSteps && (
          <div style={{ marginBottom: 8 }}>
            {KRAV.map((krav, i) => (
              <div key={krav.id} ref={el => stepRefs.current[i] = el}>
                <StepNode krav={krav} status={stepStatuses[i]} isLast={i === KRAV.length - 1}
                  expanded={!!expanded[krav.id]} onToggle={() => setExpanded(p => ({ ...p, [krav.id]: !p[krav.id] }))} />
              </div>
            ))}
          </div>
        )}

        {/* Decision */}
        <div ref={decisionRef}>
          <DecisionSection visible={phase === "done"} formData={formData} />
        </div>
      </div>

      {/* Form dialog */}
      <ApplicationDialog open={phase === "form"} onClose={closeForm} onSubmit={submitForm} />
    </>
  );
}
