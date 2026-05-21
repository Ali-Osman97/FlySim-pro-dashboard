import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Load the hidden variables from your .env file
load_dotenv()

# 2. Initialize the Gemini Brain (Using the correct Flash model!)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
# 3. Initialize the Web App
app = FastAPI(title="Engineering Flight Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to process handoff workflow: {str(e)}")