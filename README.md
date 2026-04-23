# DTF Print — Panel Operacional

An operational dashboard for managing a DTF (Direct to Film) printing business. Built with TanStack Start and deployed on Netlify.

## Features

The dashboard has seven tabs:

- **📋 Plan** — Deployment plan with editable phases and checklist tasks, with overall progress bar
- **⚙️ Producción** — Daily production log (meters printed) with cumulative growth chart and sortable history
- **📣 Campañas** — Marketing campaign tracker with investment, sales, and ROI calculation
- **📦 Productos** — Product sales ranking with quantity and revenue totals
- **💡 Ideas** — Backlog of ideas with priority levels (Alta / Media / Baja) and done/reopen toggle
- **🗃️ Stock** — Inventory management with low-stock alerts when quantity falls below minimum
- **📊 Métricas** — Key metrics dashboard: conversion rate, monthly meter goal progress, production totals

All data is persisted in the browser's `localStorage` — no backend or database required.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000` (or via Netlify CLI at `http://localhost:8888`).

```bash
# Production build
npm run build

# Preview production build
npm run preview
```
