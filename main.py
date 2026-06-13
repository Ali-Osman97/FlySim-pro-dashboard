from datetime import datetime
from typing import List, Literal
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from training_engine import (
    EvaluationReport,
    SourceCase,
    SourceCaseCreate,
    SourceCollectionResult,
    SubmissionCreate,
    TrainingEngine,
    TrainingTask,
)

# 1. Load the hidden variables from your .env file
load_dotenv()

# 2. Initialize the Gemini Brain (Using the correct Flash model!)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
training_engine = TrainingEngine(llm=llm)
# 3. Initialize the Web App
app = FastAPI(title="Engineering Flight Simulator API")

# Strictly configure CORS to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


# --- Pydantic Models for Skills ---
class RadarItem(StrictModel):
    subject: str = Field(min_length=1)
    Actual: int = Field(ge=0, le=100)
    Benchmark: int = Field(ge=0, le=100)

class SubSkillItem(StrictModel):
    name: str = Field(min_length=1)
    score: int = Field(ge=0, le=100)
    benchmark: int = Field(ge=0, le=100)
    trend: Literal["up", "stable", "down"]

class ColorTheme(StrictModel):
    text: Literal["text-indigo-400", "text-cyan-400", "text-slate-400"]
    bg: Literal["bg-indigo-500/10", "bg-cyan-500/10", "bg-slate-500/10"]
    border: Literal["border-indigo-500/20", "border-cyan-500/20", "border-slate-500/20"]
    accent: Literal["bg-indigo-500", "bg-cyan-500", "bg-slate-400"]
    fill: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")

class SkillCategoryItem(StrictModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    colorTheme: ColorTheme
    subSkills: List[SubSkillItem] = Field(min_length=1)

# --- Pydantic Models for Reports ---
class VelocityItem(StrictModel):
    month: Literal["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    Velocity: int = Field(ge=0, le=100)
    Completed: int = Field(ge=0, le=100)
    Target: int = Field(ge=0, le=100)

class EfficiencyItem(StrictModel):
    module: str = Field(min_length=1)
    Efficiency: int = Field(ge=0, le=100)
    DeliveryDays: int = Field(ge=0)

class CrewAIInsightItem(StrictModel):
    id: str = Field(min_length=1)
    category: str = Field(min_length=1)
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    impact: Literal["High", "Medium", "Low"]
    colorClass: Literal["border-cyan-500", "border-indigo-600", "border-rose-400"]

class SkillsResponse(StrictModel):
    radarData: List[RadarItem] = Field(min_length=1)
    skillCategories: List[SkillCategoryItem] = Field(min_length=1)
    crewAIInsights: List[CrewAIInsightItem]

class ReportItemModel(StrictModel):
    id: str = Field(pattern=r"^REP-\d{2}-\d{2}$")
    title: str = Field(min_length=1)
    discipline: Literal[
        "Mechatronics & Robotics",
        "Systems Architecture",
        "Project Management",
        "Software Development",
        "Risk Mitigation"
    ]
    risk: Literal["Low", "Medium", "High"]
    date: str

    @field_validator("date")
    @classmethod
    def validate_report_date(cls, value: str) -> str:
        datetime.strptime(value, "%b %d, %Y")
        return value

class ReportsResponse(StrictModel):
    velocityData: List[VelocityItem] = Field(min_length=1)
    efficiencyData: List[EfficiencyItem] = Field(min_length=1)
    crewAIInsights: List[CrewAIInsightItem]
    reportsList: List[ReportItemModel]

DASHBOARD_INSIGHTS = [
    {
        "id": "insight-1",
        "category": "SYSTEMS & MECHATRONICS",
        "title": "Kalman Filter HIL Actuation Calibration",
        "description": "CrewAI analysis detected a 15% latency reduction in actuator feedback loops during hardware-in-the-loop tests. Expand configuration adjustments to secondary roll dynamics.",
        "impact": "High",
        "colorClass": "border-cyan-500"
    },
    {
        "id": "insight-2",
        "category": "PROJECT MANAGEMENT & AGILITY",
        "title": "Agile Resource Bottleneck Correction",
        "description": "Sub-skill logs indicate high task queue load. Reallocating 2 FTEs from administrative logs to software dev modules can raise sprint velocity by an estimated 8%.",
        "impact": "Medium",
        "colorClass": "border-indigo-600"
    },
    {
        "id": "insight-3",
        "category": "RISK MITIGATION & ARCHITECTURE",
        "title": "Real-time Execution Pipeline Thresholds",
        "description": "High CPU cycles logged in control loops. Recommend immediate compiler optimizations (-O3 flag enablement) and thread priority assignment for RTOS tasks.",
        "impact": "High",
        "colorClass": "border-rose-400"
    }
]

# --- Existing Endpoints ---
@app.get("/api/sim-data")
def get_sim_data():
    return {
        "stats": [
            { "id": "overall-score", "label": "Overall Score", "value": "94.2 %", "change": "+2.4%", "changeType": "positive" },
            { "id": "flight-hours", "label": "Flight Hours", "value": "1,247 hrs", "change": "+38 hrs", "changeType": "positive" },
            { "id": "active-scenarios", "label": "Active Scenarios", "value": "12", "change": "3 pending", "changeType": "warning" },
            { "id": "skill-growth", "label": "Skill Growth", "value": "18.6 %", "change": "+5.1%", "changeType": "positive" }
        ],
        "performance": [
            { "time": "Jan", "engineTempC": 72, "altitudeStability": 80, "controlLatencyMs": 65 },
            { "time": "Feb", "engineTempC": 75, "altitudeStability": 80, "controlLatencyMs": 70 },
            { "time": "Mar", "engineTempC": 78, "altitudeStability": 82, "controlLatencyMs": 72 },
            { "time": "Apr", "engineTempC": 74, "altitudeStability": 82, "controlLatencyMs": 68 },
            { "time": "May", "engineTempC": 83, "altitudeStability": 84, "controlLatencyMs": 80 },
            { "time": "Jun", "engineTempC": 85, "altitudeStability": 84, "controlLatencyMs": 84 },
            { "time": "Jul", "engineTempC": 88, "altitudeStability": 86, "controlLatencyMs": 86 },
            { "time": "Aug", "engineTempC": 86, "altitudeStability": 86, "controlLatencyMs": 85 },
            { "time": "Sep", "engineTempC": 91, "altitudeStability": 88, "controlLatencyMs": 88 },
            { "time": "Oct", "engineTempC": 93, "altitudeStability": 88, "controlLatencyMs": 91 },
            { "time": "Nov", "engineTempC": 92, "altitudeStability": 90, "controlLatencyMs": 90 },
            { "time": "Dec", "engineTempC": 95, "altitudeStability": 90, "controlLatencyMs": 94 }
        ],
        "skills": [
            { "id": "navigation", "name": "Navigation", "value": 92 },
            { "id": "systems", "name": "Systems Management", "value": 94 },
            { "id": "comms", "name": "CRM & Communication", "value": 96 },
            { "id": "emergency", "name": "Emergency Response", "value": 85 },
            { "id": "decision", "name": "Decision Making", "value": 89 },
            { "id": "instrumentation", "name": "Instrumentation", "value": 87 }
        ],
        "recentSessions": [
            { "id": "SIM-2847", "scenario": "Engine Failure at V1", "type": "Emergency", "score": 96, "duration": "1h 42m", "date": "2 hours ago", "outcome": "Success" },
            { "id": "SIM-2846", "scenario": "ILS CAT III Approach", "type": "Navigation", "score": 91, "duration": "2h 15m", "date": "Yesterday", "outcome": "Success" },
            { "id": "SIM-2845", "scenario": "Hydraulic System Failure", "type": "Systems", "score": 78, "duration": "1h 58m", "date": "2 days ago", "outcome": "Partial" },
            { "id": "SIM-2844", "scenario": "Crosswind Landing - 35kt", "type": "Navigation", "score": 88, "duration": "0h 54m", "date": "3 days ago", "outcome": "Success" },
            { "id": "SIM-2843", "scenario": "Multi-Engine Flame Out", "type": "Emergency", "score": 72, "duration": "2h 30m", "date": "5 days ago", "outcome": "Fail" }
        ]
    }

@app.get("/api/activity")
def get_activity():
    return {
        "activityFeed": [
            {
                "id": "evt-1",
                "timestamp": "30 min ago",
                "description": "Certification Renewed: Type Rating B737-MAX renewed for 12 months."
            },
            {
                "id": "evt-2",
                "timestamp": "2 hours ago",
                "description": "Simulation Completed: Engine Failure at V1 - Score: 96%."
            },
            {
                "id": "evt-3",
                "timestamp": "5 hours ago",
                "description": "Training Module Assigned: Advanced Weather Radar Interpretation."
            },
            {
                "id": "evt-4",
                "timestamp": "Yesterday",
                "description": "Review Required: Hydraulic System Failure simulation needs instructor review."
            },
            {
                "id": "evt-5",
                "timestamp": "2 days ago",
                "description": "Scenario Scheduled: TCAS RA Response drill scheduled for March 2."
            }
        ]
    }


# --- Structured Training Task Engine ---
@app.get("/api/training/sources", response_model=List[SourceCase])
def list_training_sources():
    return training_engine.list_sources()


@app.post("/api/training/sources", response_model=SourceCollectionResult, status_code=201)
def collect_training_source(source: SourceCaseCreate):
    return training_engine.collect_source(source)


@app.get("/api/training/tasks", response_model=List[TrainingTask])
def list_training_tasks():
    return training_engine.list_tasks()


@app.get("/api/training/tasks/{task_id}", response_model=TrainingTask)
def get_training_task(task_id: str):
    task = training_engine.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Training task not found")
    return task


@app.post(
    "/api/training/tasks/{task_id}/submissions",
    response_model=EvaluationReport,
    status_code=201,
)
def evaluate_training_submission(task_id: str, submission: SubmissionCreate):
    task = training_engine.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Training task not found")
    return training_engine.evaluate(task, submission)


@app.get("/api/training/reports", response_model=List[EvaluationReport])
def list_training_reports():
    return training_engine.list_reports()

# --- New Dashboard Skills Endpoints ---
@app.get("/api/dashboard/skills", response_model=SkillsResponse)
def get_dashboard_skills():
    return {
        "radarData": [
            { "subject": "Project Management", "Actual": 85, "Benchmark": 75 },
            { "subject": "Systems Architecture", "Actual": 72, "Benchmark": 80 },
            { "subject": "Mechatronics & Robotics", "Actual": 90, "Benchmark": 85 },
            { "subject": "Software Dev", "Actual": 88, "Benchmark": 70 },
            { "subject": "Risk Mitigation", "Actual": 65, "Benchmark": 75 }
        ],
        "skillCategories": [
            {
                "id": "pm-agility",
                "title": "Project Management & Agility",
                "description": "Scope, scheduling, and sprint mechanics for complex engineering cycles.",
                "colorTheme": {
                    "text": "text-indigo-400",
                    "bg": "bg-indigo-500/10",
                    "border": "border-indigo-500/20",
                    "accent": "bg-indigo-500",
                    "fill": "#6366f1"
                },
                "subSkills": [
                    { "name": "Agile Sprint Planning", "score": 88, "benchmark": 75, "trend": "up" },
                    { "name": "Resource Allocation", "score": 82, "benchmark": 78, "trend": "stable" },
                    { "name": "Scope Management", "score": 85, "benchmark": 72, "trend": "up" }
                ]
            },
            {
                "id": "mechatronics",
                "title": "Systems & Mechatronics Engineering",
                "description": "Multidisciplinary hardware-software loops, dynamics, and automation controls.",
                "colorTheme": {
                    "text": "text-cyan-400",
                    "bg": "bg-cyan-500/10",
                    "border": "border-cyan-500/20",
                    "accent": "bg-cyan-500",
                    "fill": "#06b6d4"
                },
                "subSkills": [
                    { "name": "Hardware-Software Integration", "score": 78, "benchmark": 80, "trend": "stable" },
                    { "name": "Control Systems & Robotics", "score": 92, "benchmark": 85, "trend": "up" },
                    { "name": "Embedded Systems", "score": 85, "benchmark": 76, "trend": "up" }
                ]
            },
            {
                "id": "tech-execution",
                "title": "Technical Execution & Tech Stack",
                "description": "Modern full-stack services, system scale, and continuous deployment workflows.",
                "colorTheme": {
                    "text": "text-slate-400",
                    "bg": "bg-slate-500/10",
                    "border": "border-slate-500/20",
                    "accent": "bg-slate-400",
                    "fill": "#94a3b8"
                },
                "subSkills": [
                    { "name": "Full-Stack Dev", "score": 90, "benchmark": 70, "trend": "up" },
                    { "name": "API Architecture", "score": 85, "benchmark": 75, "trend": "stable" },
                    { "name": "Automation/DevOps", "score": 80, "benchmark": 65, "trend": "up" }
                ]
            }
        ],
        "crewAIInsights": DASHBOARD_INSIGHTS
    }

# --- New Dashboard Reports Endpoints ---
@app.get("/api/dashboard/reports", response_model=ReportsResponse)
def get_dashboard_reports():
    return {
        "velocityData": [
            { "month": "Jan", "Velocity": 82, "Completed": 78, "Target": 80 },
            { "month": "Feb", "Velocity": 85, "Completed": 84, "Target": 82 },
            { "month": "Mar", "Velocity": 89, "Completed": 88, "Target": 85 },
            { "month": "Apr", "Velocity": 92, "Completed": 90, "Target": 88 },
            { "month": "May", "Velocity": 94, "Completed": 95, "Target": 90 },
            { "month": "Jun", "Velocity": 98, "Completed": 96, "Target": 95 }
        ],
        "efficiencyData": [
            { "module": "Actuation", "Efficiency": 92, "DeliveryDays": 14 },
            { "module": "Power Systems", "Efficiency": 85, "DeliveryDays": 18 },
            { "module": "Agile Sprints", "Efficiency": 88, "DeliveryDays": 12 },
            { "module": "Embedded OS", "Efficiency": 95, "DeliveryDays": 10 },
            { "module": "Control Loops", "Efficiency": 78, "DeliveryDays": 22 }
        ],
        "crewAIInsights": DASHBOARD_INSIGHTS,
        "reportsList": [
            { "id": "REP-26-05", "title": "Q2 Mechatronics Sprint Diagnostic", "discipline": "Mechatronics & Robotics", "risk": "Low", "date": "May 18, 2026" },
            { "id": "REP-26-04", "title": "HIL Integration Latency Audit", "discipline": "Systems Architecture", "risk": "Medium", "date": "Apr 22, 2026" },
            { "id": "REP-26-03", "title": "Agile Resource Re-allocation Review", "discipline": "Project Management", "risk": "High", "date": "Mar 15, 2026" },
            { "id": "REP-26-02", "title": "API Microservices Scalability Stress-Test", "discipline": "Software Development", "risk": "Low", "date": "Feb 28, 2026" },
            { "id": "REP-26-01", "title": "System Security & RTOS Risk Vectoring", "discipline": "Risk Mitigation", "risk": "Medium", "date": "Jan 10, 2026" }
        ]
    }

class HandOffSubmission(BaseModel):
    scenario_title: str
    user_documentation: str

@app.post("/api/submit-handoff")
def process_handoff(submission: HandOffSubmission):
    print(f"--> Received submission for: {submission.scenario_title}")
    
    # --- AGENT 1: The Technical Expert ---
    senior_engineer = Agent(
        role='Senior Mechatronics & Robotics Engineer',
        goal='Critically evaluate component selection and system integration.',
        backstory='You are a veteran Mechatronics engineer. You check for cross-disciplinary logic, load tolerances, and safety sequences.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # --- AGENT 2: The Workflow Master ---
    project_manager = Agent(
        role='Technical Project Manager',
        goal='Analyze the engineering review for timeline bottlenecks, resource allocation, and workflow automation opportunities.',
        backstory='You are a master of project management and workflow automation. You take raw technical data and translate it into risk assessments and actionable schedules.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # --- TASK 1: Technical Review ---
    engineering_task = Task(
        description=f"Review the documentation for '{submission.scenario_title}'.\n\nUser's Documentation:\n{submission.user_documentation}\n\nProvide a strict technical review pointing out missing metrics or hardware flaws.",
        expected_output="A 2-paragraph technical code-review.",
        agent=senior_engineer
    )

    # --- TASK 2: Project Management Assessment ---
    pm_task = Task(
        description="Read the Senior Engineer's technical review. Identify potential project delays, workflow automation needs, and resource constraints based ONLY on the technical gaps they found.",
        expected_output="A 1-paragraph project management risk assessment and workflow action plan.",
        agent=project_manager
    )

    # --- THE AUTOMATED WORKFLOW ---
    crew = Crew(
        agents=[senior_engineer, project_manager],
        tasks=[engineering_task, pm_task],
        process=Process.sequential # This tells them to work in order!
    )

    print("--> Handing off to the AI Team...")
    try:
        result = crew.kickoff()
        
        return {
            "status": "completed",
            "scenario": submission.scenario_title,
            "ai_feedback": str(result)
        }
    except Exception as e:
        print(f"--> Error during crew execution: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process handoff workflow: {str(e)}")
