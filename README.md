# KIF — Dagpengeansøgning Frontend

React/TypeScript frontend til KIF (KI Forvaltning) dagpengeansøgningsflow.

## Tech Stack

- React 19 + TypeScript
- Vite 7 (dev server + bundler)
- Tailwind CSS 4
- React Router DOM 7
- Google Fonts: DM Sans, Source Serif 4

## Kom i gang

```bash
npm install
npm run dev
```

Åbn [http://localhost:5173/ansoegning](http://localhost:5173/ansoegning)

## Projektstruktur

```
src/
├── pages/
│   ├── KIFAssessmentPage.tsx   # Hovedside — dagpengeansøgning
│   ├── HomePage.tsx            # Velkomstside
│   └── KISPage.tsx             # KI Sagsbehandler
├── components/sidebar/         # Sidebar navigation
├── layouts/RootLayout.tsx      # Sidebar + content layout
├── routes/routes.tsx           # Route-definitioner
├── services/api.tsx            # API service (skal erstattes med ny backend)
├── contexts/SidebarContext.tsx  # Sidebar state
├── styles/global.css           # Tailwind + farvevariabler
└── types/                      # TypeScript interfaces
```

## Routes

| Path | Side | Beskrivelse |
|------|------|-------------|
| `/` | HomePage | Velkomst med navigation cards |
| `/ansoegning` | KIFAssessmentPage | Dagpengeansøgning (hovedflow) |
| `/kisagsbehandler` | KISPage | KI Sagsbehandler |

## Ansøgningsflow (KIFAssessmentPage)

1. **Landing** — Viser medlemsoplysninger, knap til at starte ansøgning
2. **Formular** — Ledighedserklæring med 9 sektioner + betinget sygdomsunderformular
3. **Vurdering** — 7 krav vurderes sekventielt med animeret stepper
4. **Afgørelse** — Godkendt/afvist med juridiske referencer og EU AI Act disclaimer

### Demo
Klik "Demo: Udfyld med testdata" i formularen for at se flowet med preudfyldte data.

## Status

- Frontend: Fungerende prototype
- Backend: Ikke implementeret endnu — krav-vurderingen er simuleret med timers
- `api.tsx` peger på en gammel backend og skal erstattes
