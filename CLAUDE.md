# KIF New Front-End

React 19 + TypeScript + Vite 7 + Tailwind CSS 4 frontend til dagpengeansøgning og sagsbehandling.

## Projektbeskrivelse
Se `KIF-frontend-kontekst.md` for fuld projektbeskrivelse, filstruktur, routes og designdetaljer.

## Vigtige regler
- INGEN hardcoding af juridiske værdier (beløb, satser, perioder, §-referencer) i koden. Alle kvantitative værdier læses fra `src/data/satsoversigt_dagpenge.json`.
- Formularfelter mapper til et JSON-format der bruges af et eksternt juridisk vurderingssystem. Transformationen sker i `src/utils/formToJSON.ts`.
- KIFAssessmentPage.tsx bruger inline styles (konverteret fra prototype). Nye komponenter og sider bruger Tailwind.
- Sprog: Al UI-tekst er på dansk.

## Nøglefiler
- `src/pages/KIFAssessmentPage.tsx` — Hovedside: borgerens ansøgningsflow
- `src/pages/CaseworkerPage.tsx` — Sagsbehandler-panel (redigerbar indkomst, evaluering)
- `src/utils/formToJSON.ts` — Formular → JSON transformation
- `src/utils/quickEval.ts` — Deterministisk kvik-evaluering mod satsoversigt
- `src/data/satsoversigt_dagpenge.json` — Kvantitative værdier fra juridisk database (36 kategorier, 145+ værdier)
- `src/contexts/CaseContext.tsx` — Delt state mellem borger-flow og sagsbehandler-panel

## Datakilde
`satsoversigt_dagpenge.json` indeholder alle gældende tærskelværdier for dagpenge (indkomstkrav, indkomstloft, perioder, timegrænser, satser etc.) med provision_id og gyldighedsdato for hver værdi. Filen er genereret fra en juridisk graph-database og opdateres ved lovændringer. Koden må aldrig indeholde disse værdier direkte — altid læs fra filen.
