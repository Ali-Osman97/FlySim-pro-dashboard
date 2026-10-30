# FlySim Pro

An AI-assisted practice and skills-assessment prototype for computer science, engineering, and project management. FlySim Pro turns structured project cases, incidents, and design briefs into practical tasks, evaluates written solutions against a rubric, and produces feedback and skill-gap recommendations.

FlySim Pro is independently developed and solely owned by [Ali-Osman97](https://github.com/Ali-Osman97). The interface also uses the name **FlightSim Pro** and retains aviation-themed demonstration content.

## Development status

This is a development prototype with an implemented training workflow and a dashboard containing a mixture of backend responses and sample data. Repository review alone does not establish a production deployment, real user counts, or measured learning outcomes.

- **Implemented:** case entry, deterministic task generation, skill mapping, written submissions, Gemini-assisted rubric evaluation, fallback evaluation, and SQLite persistence.
- **Demonstration data:** overview statistics, flight sessions, performance charts, dashboard skills, report lists, and the displayed dashboard “CrewAI insights” are predefined examples. Their numerical improvements are sample content, not measured product results.
- **Integration limits:** the training workflow does not automatically ingest external cases or use AI to generate task briefs. Task generation uses templates and keyword-based skill selection. Authentication and per-user data isolation are not implemented in the reviewed API.
- **AI limits:** fallback scores use keyword coverage and response length. Skill scores combine the overall rubric score with keyword evidence, including when Gemini evaluates the rubric. These are prototype assessment heuristics, not validated competency measurements.

## What you can do

1. Open the simulation workspace and select one of three seeded cases: airport baggage modernization, a flight telemetry ingestion outage, or an autonomous inspection drone pilot.
2. Add a project, incident, case study, or design brief with context, objectives, and constraints.
3. Review the generated **Engineering Decision Brief**, deliverables, mapped skills, and scoring rubric.
4. Submit a written solution of 80–20,000 characters.
5. Receive an overall score, criterion feedback, strengths, skill assessments, gaps against a benchmark of 75, and next steps.
6. Reload the application to retrieve persisted cases, tasks, submissions, and reports. The workspace attempts to restore the latest report.

The rubric weights technical design at 30%, verification at 25%, safety and risk at 25%, and delivery planning at 20%. Gemini is attempted for submissions with `use_ai: true`; unavailable or invalid AI output falls back to the local rubric and is identified by `evaluator_mode: "rubric_fallback"`.

The dashboard also includes report filtering, CSV export, and a printable report view. PDF output uses the browser's **Save as PDF** print option. Some screens retain fallback sample content when services are unavailable; submitting solutions and saving cases still require the backend.

## Stack and architecture

| Area | Implementation |
| --- | --- |
| Web application | Next.js 16.1.6 App Router, React 19.2.3, TypeScript |
| UI and charts | Tailwind CSS 4, Radix UI, Lucide icons, Recharts |
| Frontend validation | Zod |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Training storage | SQLite via Python's standard library, with WAL mode |
| Training evaluator | Gemini `gemini-2.5-flash` through `langchain-google-genai` |
| Additional AI workflow | CrewAI sequential engineering and project-management review endpoint |
| Existing tests | Python `unittest`; Jest and React Testing Library |

The browser calls Next.js API routes, which forward requests to FastAPI. FastAPI uses `TrainingEngine` for case/task management, evaluation, and persistence. The separate `/api/submit-handoff` endpoint runs a CrewAI review; it is distinct from the structured training evaluator. `latest_ai_development/` contains a separate CrewAI research/report experiment and is not required for the main training workflow.

## Run locally

You need Git, Python compatible with the backend dependencies, and Node.js/npm compatible with Next.js 16. The separate CrewAI experiment declares Python >=3.10,<3.14; backend Python dependencies are currently unpinned.

### 1. Clone and prepare the backend

From PowerShell:

```powershell
git clone https://github.com/Ali-Osman97/FlySim-pro-dashboard.git
cd FlySim-pro-dashboard
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

On macOS/Linux, activate the environment with `source .venv/bin/activate` instead.

Create a `.env` file in the repository root for the LangChain Gemini integration:

```dotenv
GOOGLE_API_KEY=your_google_ai_api_key
# Optional: override the default SQLite database location
# TRAINING_DB_PATH=data/training_engine.db
```

Keep credentials out of Git. `main.py` constructs the Gemini client at startup, so a valid provider configuration may be required even if you intend to submit with `use_ai: false`. The standalone training engine can run without an LLM; that does not guarantee keyless startup of the API.

Start FastAPI from the repository root:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start the frontend

In a second terminal, enter `flysim-ui` from the repository root:

```powershell
cd flysim-ui
npm ci
npm run dev
```

Open [http://localhost:3000/dashboard/simulation](http://localhost:3000/dashboard/simulation) for the training workflow, or `/dashboard/overview` for the demonstration dashboard.

Next.js defaults to `http://localhost:8000` for upstream requests. To change it, create `flysim-ui/.env.local`:

```dotenv
API_URL=http://127.0.0.1:8000
```

`API_URL` is a server-side setting. Restart the frontend after changing environment files. The backend CORS configuration currently allows `http://localhost:3000` and `http://127.0.0.1:3000`.

### 3. Understand persistence

The backend creates `data/training_engine.db` by default and seeds the three example cases without replacing existing rows. `TRAINING_DB_PATH` can point to another writable location. Back up the database if you need to preserve practice history; use persistent storage when deploying.

## API overview

Paths below are FastAPI paths. Interactive request/response schemas are available at `/docs`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | `/api/training/sources` | List or add cases; adding a case also generates its task |
| GET | `/api/training/tasks` | List tasks |
| GET | `/api/training/tasks/{task_id}` | Retrieve a task |
| POST | `/api/training/tasks/{task_id}/submissions` | Evaluate and store a solution |
| GET | `/api/training/reports` | Retrieve stored evaluation reports |
| GET | `/api/sim-data`, `/api/activity` | Demonstration overview and activity data |
| GET | `/api/dashboard/skills`, `/api/dashboard/reports` | Validated dashboard sample data |
| POST | `/api/submit-handoff` | Separate CrewAI engineering/management review |

Submission body:

```json
{
  "solution": "Your complete engineering decision brief, with at least 80 characters of supporting detail.",
  "use_ai": true
}
```

Set `use_ai` to `false` to select the local rubric evaluator. The current workspace UI submits with AI enabled and lets the backend fall back when necessary.

## Development checks

Run existing backend tests from the repository root:

```powershell
python -m unittest test_training_engine.py
```

These cover seeded task generation, case collection, fallback reports, mocked AI score normalization, and persistence across engine instances. They do not verify live Gemini requests.

From `flysim-ui`:

```powershell
npm test -- --runInBand
npm run lint
npm run build
```

For a built frontend, use `npm run start` after `npm run build`; run FastAPI separately. These are the repository's available checks, not a claim that they currently pass in every environment.

## Repository layout

```text
main.py                     FastAPI application and additional CrewAI handoff
training_engine.py          Models, task generation, evaluation, SQLite repository
test_training_engine.py     Backend training-engine tests
requirements.txt            Backend dependencies
flysim-ui/
  app/                      Pages and Next.js API proxy routes
  components/dashboard/     Overview, simulation, skills, reports
  lib/                      Zod schemas, proxies, fallback data, exports
latest_ai_development/      Separate CrewAI research/report experiment
```

## Ownership and license

Project repository: [Ali-Osman97/FlySim-pro-dashboard](https://github.com/Ali-Osman97/FlySim-pro-dashboard).

Copyright (c) 2026 Ali-Osman97. **All rights reserved.** The original project materials are proprietary. Use, copying, modification, and redistribution require prior written permission, subject to the exceptions stated in [LICENSE](LICENSE). Third-party materials retain their respective licenses. See [LICENSE](LICENSE) for the complete notice and permission-request details.
