# HCI LinkedIn Job Search Prototypes

This is one React, Vite, and Tailwind CSS project containing three independent prototype entry points.

## Structure

- `index.html` — prototype selector
- `integrated-search-and-compare/index.html` — Prototype A, integrated search and compare
- `linkedin-jobs-shortlist-narrower/index.html` — Prototype B, shortlist narrowing
- `shortlisted-job-comparison/index.html` — Prototype C, shortlisted job comparison
- `src/alternatives/<name>/` — each prototype's React entry point, app, and isolated global stylesheet
- `vite.config.ts` — shared multi-page build and Figma Make configuration

Keep alternative-specific code and CSS inside its existing directory. Do not import one alternative's stylesheet into another entry point.
