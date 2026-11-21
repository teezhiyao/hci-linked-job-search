# HCI LinkedIn Job Search Prototypes

This repository contains one Figma Make-compatible Vite application with three isolated design alternatives.

## Design alternatives

- `integrated-search-and-compare`
- `linkedin-jobs-shortlist-narrower`
- `shortlisted-job-comparison`

Each alternative has its own page and application entry point under `src/alternatives/`. They share one package manifest, build configuration, Figma Make configuration, and GitHub Pages deployment.

## Run locally

```sh
pnpm install
pnpm dev
```

Open the root page to select an alternative. Prototype state is isolated by each alternative's existing browser-storage keys.
