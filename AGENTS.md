# HCI LinkedIn Job Search Prototypes

This is one React, Vite, and Tailwind CSS project containing three independent prototype entry points.

## Structure

- `index.html` — prototype selector
- `integrated-search-and-compare/index.html` — Prototype A, criteria-guided search
- `shortlisted-job-comparison/index.html` — Prototype B, multi-job comparison
- `linkedin-jobs-shortlist-narrower/index.html` — Prototype C, pairwise shortlist narrowing
- `src/alternatives/<name>/` — each prototype's React entry point, app, and isolated global stylesheet
- `vite.config.ts` — shared multi-page build and Figma Make configuration

Keep alternative-specific code and CSS inside its existing directory. Do not import one alternative's stylesheet into another entry point.
