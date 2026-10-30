# FlySim Pro — Web application

The Next.js frontend for FlySim Pro's engineering, computer science, and project-management practice prototype. For implemented features, backend setup, data limitations, API details, and ownership information, see the [project README](../README.md).

## Local development

Start the FastAPI backend using the instructions in the project README. Then, from this directory:

```powershell
npm ci
npm run dev
```

Open [the training workspace](http://localhost:3000/dashboard/simulation) or [the demonstration overview](http://localhost:3000/dashboard/overview).

The server-side API routes forward requests to `http://localhost:8000` by default. To change that address, create `.env.local` in this directory:

```dotenv
API_URL=http://127.0.0.1:8000
```

Restart Next.js after changing environment settings. Keep API credentials in the backend environment, not browser-facing variables.

## Features and limitations

- Enter source cases, browse generated tasks, submit written solutions, and display evaluation feedback and skill gaps.
- View dashboard charts, skill comparisons, and reports; filter reports, export CSV, and print or save a report as PDF.
- Validate API responses with Zod and display fallback sample content on supported screens when services are unavailable.

Dashboard metrics and displayed dashboard AI insights include predefined examples. Fallback task browsing does not provide offline submission or persistence; saving cases and evaluating solutions require FastAPI. The backend records whether an evaluation used AI or the rubric fallback.

## Stack

Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, Radix UI, Recharts, Lucide, and Zod. Tests use Jest and React Testing Library.

## Available commands

```powershell
npm run dev
npm test -- --runInBand
npm run lint
npm run build
npm run start
```

`start` serves the production frontend after a successful build. FastAPI runs separately. See the root README for the project's development status and licensing status.
