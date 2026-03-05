# Shopper360 — AI Shopper Intelligence Dashboard
## Project Briefing for Claude Code

### What this is
Shopper360 is an AI-powered shopper intelligence dashboard for pharmacy retail. It analyses customer shopping patterns, basket composition, visit frequency, and retention — providing segmentation, benchmarking, and actionable insights. Built for NostraData Pty Ltd.

### How to run
```bash
npm install
node setup-data.js     # Generate CSV data into public/data/
npm run dev            # Vite dev server at http://localhost:5173
# Login: George / 1234
```

### Tech stack
- React 19 + React Router v7 (SPA, client-side routing)
- Vite 6 (build tool)
- TypeScript 5.6 (strict mode)
- Tailwind CSS v4 + @tailwindcss/vite (CSS framework)
- Radix UI (unstyled composables)
- Recharts (charting)
- TanStack React Table (data tables)
- PapaParse 5.4.1 (CSV parsing)
- date-fns 4.1 (date handling)
- Zod + React Hook Form (validation)
- Lucide React (icons)

### Data source
- `Shopper360_Customers.csv` — 5,200 customers with 23 columns
- `Shopper360_Summary.csv` — 12 monthly store summaries
- `Shopper360_National.csv` — 12 monthly national benchmarks (P25/Median/P75)
- `Shopper360_Categories.csv` — 15 product categories with cross-sell data
- `Shopper360_Segments.csv` — Monthly segment breakdown (5 segments x 12 months)
- All generated via `setup-data.js` into `public/data/`

### Key features
1. **Login Screen** — Split-screen hero with animated stat cards, username/PIN auth (George/1234)
2. **Dashboard** — 6 KPI cards + 4 charts (revenue trend, segment pie, basket/retention dual-axis, stacked segment bar)
3. **Shoppers** — Full customer table (5,200 rows), TanStack Table with sorting/search/filter/pagination, CSV export
4. **Basket Analysis** — Category revenue, cross-sell scatter, items per basket, category growth, cross-sell pairings table
5. **Visit Patterns** — Foot traffic trend, retention vs churn, visit frequency distribution, recency distribution, new customer acquisition
6. **Segments** — Customer/revenue pie charts, retention by segment, detailed segment summary table
7. **National Benchmarks** — P25/Median/P75 comparisons for basket, retention, visits; tier ranking (Top 25%, Above Median, Below Median)
8. **Campaigns** — Campaign management UI (sample data), stats, SMS/email/in-store/loyalty types (UI-only)
9. **Ask Shopper360 Agent** — Rule-based Q&A with 7 intent handlers, traffic light confidence (GREEN/AMBER/RED), methodology disclosure, follow-up suggestions
10. **Admin Branding** — 3 pharmacy liveries (NostraData, Priceline, Amcal) with live theme switching via CSS variables

### Customer segments
- **Power Shoppers** — Visit weekly+, high basket value, retention 75-99
- **Regular Shoppers** — Visit 2-3x/month, moderate spend, retention 50-80
- **Occasional Visitors** — Visit monthly or less, low spend, retention 25-55
- **New Customers** — Joined within 90 days, variable behaviour
- **At-Risk** — No visit in 45+ days, declining activity, retention 5-30

### Provider hierarchy
```
BrowserRouter → ThemeProvider → AuthProvider → Routes
  /login (public)
  RequireAuth → DataProvider → AppLayout → [route pages]
```

### Theming (Multi-Livery)
Three themes via CSS custom properties, persisted to localStorage:
- **NostraData** — Bondi Blue (#0A8BA8) + Persian Green (#10B39B)
- **Priceline Pharmacy** — Magenta (#E31C79) + Cyan (#00A3E0)
- **Amcal** — Sky Blue (#00A8E5) + Green (#6DC24B)

### What NOT to change
- CSV column names — they are the data contract
- Agent confidence governance model (GREEN/AMBER/RED)
- Theme switching mechanism (CSS custom properties)
- Provider nesting order (Theme → Auth → Data)

### Known gaps / next priorities
- Cohort builder (CRUD in localStorage) — infrastructure exists, UI not yet built
- Customer detail page (single customer deep-dive)
- Campaign execution — currently UI-only, needs messaging provider integration
- Agent is rule-based — LLM stub can be added
- No backend — all data is client-side CSV
