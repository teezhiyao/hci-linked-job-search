# HCI LinkedIn Job Search Prototypes

This is one React, Vite, and Tailwind CSS project containing three independent prototype entry points.

## Structure

- `index.html` — prototype selector
- `integrated-search-and-compare/index.html` — enhanced search workspace
- `shortlisted-job-comparison/index.html` — shortlist comparison table
- `linkedin-jobs-shortlist-narrower/index.html` — two-job comparison workflow
- `src/alternatives/<name>/` — each prototype's React entry point, app, and isolated global stylesheet
- `vite.config.ts` — shared multi-page build and Figma Make configuration

Keep alternative-specific code and CSS inside its existing directory. Do not import one alternative's stylesheet into another entry point.
