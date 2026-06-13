import json
import os
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


SkillCategory = Literal["Computer Science", "Engineering", "Project Management"]
Difficulty = Literal["Foundation", "Intermediate", "Advanced"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SourceCaseCreate(StrictModel):
    title: str = Field(min_length=5, max_length=160)
    summary: str = Field(min_length=30, max_length=1200)
    domain: str = Field(min_length=2, max_length=100)
    source_type: Literal["Project", "Incident", "Case Study", "Design Brief"]
    context: str = Field(min_length=30, max_length=4000)
    objectives: List[str] = Field(min_length=1, max_length=8)
    constraints: List[str] = Field(default_factory=list, max_length=8)


class SourceCase(SourceCaseCreate):
    id: str
    collected_at: str


class SkillMapping(StrictModel):
    skill_id: str
    name: str
    category: SkillCategory
    weight: int = Field(ge=1, le=100)


class RubricCriterion(StrictModel):
    id: str
    title: str
    description: str
    weight: int = Field(ge=1, le=100)
    evidence_terms: List[str] = Field(min_length=1)


class TrainingTask(StrictModel):
    id: str
    source_id: str
    title: str
    domain: str
    difficulty: Difficulty
    brief: str
    scenario: str
    deliverables: List[str] = Field(min_length=1)
    constraints: List[str]
    estimated_minutes: int = Field(ge=10, le=480)
    skills: List[SkillMapping] = Field(min_length=1)
    rubric: List[RubricCriterion] = Field(min_length=1)


class SourceCollectionResult(StrictModel):
    source: SourceCase
    task: TrainingTask


class SubmissionCreate(StrictModel):
    solution: str = Field(min_length=80, max_length=20000)
    use_ai: bool = True


class StoredSubmission(SubmissionCreate):
    id: str
    task_id: str
    submitted_at: str


class CriterionAssessment(StrictModel):
    criterion_id: str
    title: str
    score: int = Field(ge=0, le=100)
    feedback: str
    evidence_found: List[str]


class SkillAssessment(StrictModel):
    skill_id: str
    name: str
    category: SkillCategory
    score: int = Field(ge=0, le=100)
    benchmark: int = Field(ge=0, le=100)


class SkillGap(StrictModel):
    skill_id: str
    name: str
    category: SkillCategory
    score: int = Field(ge=0, le=100)
    target: int = Field(ge=0, le=100)
    gap: int = Field(ge=0, le=100)
    recommendation: str


class EvaluationReport(StrictModel):
    submission_id: str
    task_id: str
    task_title: str
    submitted_at: str
    evaluator_mode: Literal["ai", "rubric_fallback"]
    overall_score: int = Field(ge=0, le=100)
    summary: str
    strengths: List[str]
    criterion_assessments: List[CriterionAssessment]
    skill_assessments: List[SkillAssessment]
    skill_gaps: List[SkillGap]
    next_steps: List[str]


class AICriterionAssessment(StrictModel):
    criterion_id: str
    score: int = Field(ge=0, le=100)
    feedback: str = Field(min_length=10)
    evidence_found: List[str]


class AIEvaluationDraft(StrictModel):
    summary: str = Field(min_length=20)
    strengths: List[str] = Field(min_length=1, max_length=5)
    criterion_assessments: List[AICriterionAssessment] = Field(min_length=1)
    next_steps: List[str] = Field(min_length=1, max_length=5)


class SQLiteTrainingRepository:
    def __init__(self, database_path: str | Path):
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_schema()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path, timeout=10)
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = self._connect()
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize_schema(self) -> None:
        with self._connection() as connection:
            connection.execute("PRAGMA journal_mode = WAL")
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS sources (
                    id TEXT PRIMARY KEY,
                    collected_at TEXT NOT NULL,
                    payload TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    source_id TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    FOREIGN KEY (source_id) REFERENCES sources(id)
                );

                CREATE TABLE IF NOT EXISTS submissions (
                    id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    submitted_at TEXT NOT NULL,
                    solution TEXT NOT NULL,
                    use_ai INTEGER NOT NULL,
                    FOREIGN KEY (task_id) REFERENCES tasks(id)
                );

                CREATE TABLE IF NOT EXISTS reports (
                    submission_id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    submitted_at TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    FOREIGN KEY (submission_id) REFERENCES submissions(id),
                    FOREIGN KEY (task_id) REFERENCES tasks(id)
                );

                CREATE INDEX IF NOT EXISTS idx_tasks_source_id
                    ON tasks(source_id);
                CREATE INDEX IF NOT EXISTS idx_submissions_task_id
                    ON submissions(task_id);
                CREATE INDEX IF NOT EXISTS idx_reports_submitted_at
                    ON reports(submitted_at DESC);
                """
            )

    def save_source_and_task(
        self, source: SourceCase, task: TrainingTask, *, insert_only: bool = False
    ) -> None:
        operation = "INSERT OR IGNORE" if insert_only else "INSERT OR REPLACE"
        with self._connection() as connection:
            connection.execute(
                f"{operation} INTO sources (id, collected_at, payload) VALUES (?, ?, ?)",
                (source.id, source.collected_at, source.model_dump_json()),
            )
            connection.execute(
                f"{operation} INTO tasks (id, source_id, payload) VALUES (?, ?, ?)",
                (task.id, task.source_id, task.model_dump_json()),
            )

    def list_sources(self) -> List[SourceCase]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT payload FROM sources ORDER BY rowid"
            ).fetchall()
        return [SourceCase.model_validate_json(row[0]) for row in rows]

    def list_tasks(self) -> List[TrainingTask]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT payload FROM tasks ORDER BY rowid"
            ).fetchall()
        return [TrainingTask.model_validate_json(row[0]) for row in rows]

    def get_task(self, task_id: str) -> Optional[TrainingTask]:
        with self._connection() as connection:
            row = connection.execute(
                "SELECT payload FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
        return TrainingTask.model_validate_json(row[0]) if row else None

    def save_submission(self, submission: StoredSubmission) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO submissions (
                    id, task_id, submitted_at, solution, use_ai
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    submission.id,
                    submission.task_id,
                    submission.submitted_at,
                    submission.solution,
                    int(submission.use_ai),
                ),
            )

    def get_submission(self, submission_id: str) -> Optional[StoredSubmission]:
        with self._connection() as connection:
            row = connection.execute(
                """
                SELECT id, task_id, submitted_at, solution, use_ai
                FROM submissions
                WHERE id = ?
                """,
                (submission_id,),
            ).fetchone()
        if row is None:
            return None
        return StoredSubmission(
            id=row[0],
            task_id=row[1],
            submitted_at=row[2],
            solution=row[3],
            use_ai=bool(row[4]),
        )

    def save_report(self, report: EvaluationReport) -> None:
        with self._connection() as connection:
            connection.execute(
                """
                INSERT OR REPLACE INTO reports (
                    submission_id, task_id, submitted_at, payload
                ) VALUES (?, ?, ?, ?)
                """,
                (
                    report.submission_id,
                    report.task_id,
                    report.submitted_at,
                    report.model_dump_json(),
                ),
            )

    def list_reports(self) -> List[EvaluationReport]:
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT payload
                FROM reports
                ORDER BY submitted_at DESC, rowid DESC
                """
            ).fetchall()
        return [EvaluationReport.model_validate_json(row[0]) for row in rows]


SKILL_LIBRARY: Dict[str, SkillMapping] = {
    "cs-architecture": SkillMapping(
        skill_id="cs-architecture",
        name="Software Architecture",
        category="Computer Science",
        weight=20,
    ),
    "cs-data": SkillMapping(
        skill_id="cs-data",
        name="Data & API Design",
        category="Computer Science",
        weight=15,
    ),
    "cs-reliability": SkillMapping(
        skill_id="cs-reliability",
        name="Reliability Engineering",
        category="Computer Science",
        weight=15,
    ),
    "eng-systems": SkillMapping(
        skill_id="eng-systems",
        name="Systems Engineering",
        category="Engineering",
        weight=20,
    ),
    "eng-validation": SkillMapping(
        skill_id="eng-validation",
        name="Verification & Validation",
        category="Engineering",
        weight=15,
    ),
    "eng-safety": SkillMapping(
        skill_id="eng-safety",
        name="Safety & Risk Engineering",
        category="Engineering",
        weight=15,
    ),
    "pm-planning": SkillMapping(
        skill_id="pm-planning",
        name="Delivery Planning",
        category="Project Management",
        weight=15,
    ),
    "pm-risk": SkillMapping(
        skill_id="pm-risk",
        name="Risk Management",
        category="Project Management",
        weight=15,
    ),
    "pm-stakeholders": SkillMapping(
        skill_id="pm-stakeholders",
        name="Stakeholder Communication",
        category="Project Management",
        weight=10,
    ),
}


SKILL_EVIDENCE = {
    "cs-architecture": ["architecture", "service", "interface", "component", "dependency"],
    "cs-data": ["api", "schema", "data", "event", "validation"],
    "cs-reliability": ["retry", "timeout", "monitoring", "fallback", "availability"],
    "eng-systems": ["requirement", "trade-off", "integration", "system", "constraint"],
    "eng-validation": ["test", "verification", "acceptance", "metric", "validation"],
    "eng-safety": ["hazard", "safety", "failure", "mitigation", "risk"],
    "pm-planning": ["milestone", "schedule", "owner", "dependency", "timeline"],
    "pm-risk": ["risk", "probability", "impact", "mitigation", "contingency"],
    "pm-stakeholders": ["stakeholder", "communication", "review", "decision", "approval"],
}


SEED_SOURCES = [
    SourceCaseCreate(
        title="Airport Baggage Control Modernization",
        summary="Modernize a legacy baggage handling control system while keeping airport operations available.",
        domain="Systems Integration",
        source_type="Project",
        context=(
            "A regional airport has intermittent conveyor stoppages, duplicated PLC logic, and limited telemetry. "
            "The modernization must integrate new sensors, edge controllers, and a web operations console without "
            "causing unacceptable baggage delays."
        ),
        objectives=[
            "Design a phased target architecture.",
            "Define verification and operational acceptance criteria.",
            "Create a delivery and risk plan.",
        ],
        constraints=[
            "Maximum planned outage is four hours.",
            "Existing PLCs must remain operational during phase one.",
            "Operational staff require auditable manual overrides.",
        ],
    ),
    SourceCaseCreate(
        title="Flight Telemetry Ingestion Outage",
        summary="Investigate and prevent recurring data loss in a high-volume flight telemetry pipeline.",
        domain="Software Reliability",
        source_type="Incident",
        context=(
            "A telemetry service loses messages during traffic spikes. Producers retry aggressively, consumers process "
            "events out of order, and operators lack useful saturation alerts. The incident affected engineering "
            "analysis and delayed a certification test."
        ),
        objectives=[
            "Produce a root-cause hypothesis and resilient architecture.",
            "Define measurable reliability tests.",
            "Plan remediation ownership and rollout.",
        ],
        constraints=[
            "No loss of accepted events.",
            "The migration must remain backward compatible.",
            "The team has six weeks for the first production release.",
        ],
    ),
    SourceCaseCreate(
        title="Autonomous Inspection Drone Fleet",
        summary="Plan a safe pilot for autonomous industrial inspection drones across multiple facilities.",
        domain="Robotics Program Delivery",
        source_type="Design Brief",
        context=(
            "An industrial operator wants drones to inspect elevated equipment. The solution combines route planning, "
            "computer vision, battery management, and maintenance workflows. Facility managers need a controlled pilot "
            "before approving a broader rollout."
        ),
        objectives=[
            "Define the system concept and safety boundaries.",
            "Create a pilot validation plan.",
            "Recommend phased delivery gates and stakeholder decisions.",
        ],
        constraints=[
            "Flights must remain inside approved geofences.",
            "Human operators retain emergency override authority.",
            "Pilot evidence must support an executive scale decision.",
        ],
    ),
]


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _slug(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized[:60] or uuid4().hex[:12]


def _copy_skills(*skill_ids: str) -> List[SkillMapping]:
    return [SKILL_LIBRARY[skill_id].model_copy(deep=True) for skill_id in skill_ids]


def _select_skills(source: SourceCase) -> List[SkillMapping]:
    text = f"{source.domain} {source.summary} {source.context}".lower()
    selected = ["eng-systems", "eng-validation", "pm-planning", "pm-risk"]

    if any(term in text for term in ["software", "data", "api", "telemetry", "pipeline"]):
        selected.extend(["cs-architecture", "cs-data", "cs-reliability"])
    else:
        selected.extend(["cs-architecture", "cs-reliability"])

    if any(term in text for term in ["safety", "drone", "robot", "control", "airport"]):
        selected.append("eng-safety")

    selected.append("pm-stakeholders")
    return _copy_skills(*dict.fromkeys(selected))


def _build_rubric() -> List[RubricCriterion]:
    return [
        RubricCriterion(
            id="technical-design",
            title="Technical design quality",
            description="The solution presents a coherent architecture, interfaces, and engineering trade-offs.",
            weight=30,
            evidence_terms=["architecture", "interface", "trade-off", "component", "integration"],
        ),
        RubricCriterion(
            id="validation",
            title="Verification and measurable outcomes",
            description="The solution defines tests, acceptance criteria, metrics, and operational evidence.",
            weight=25,
            evidence_terms=["test", "acceptance", "metric", "validation", "monitoring"],
        ),
        RubricCriterion(
            id="risk",
            title="Safety and risk control",
            description="The solution identifies failure modes and provides specific mitigations or contingencies.",
            weight=25,
            evidence_terms=["risk", "failure", "mitigation", "safety", "contingency"],
        ),
        RubricCriterion(
            id="delivery",
            title="Delivery and stakeholder plan",
            description="The solution defines phases, owners, dependencies, decisions, and communication.",
            weight=20,
            evidence_terms=["milestone", "owner", "dependency", "stakeholder", "rollout"],
        ),
    ]


def generate_task(source: SourceCase) -> TrainingTask:
    difficulty: Difficulty = "Advanced" if len(source.constraints) >= 3 else "Intermediate"
    task_id = f"task-{_slug(source.id)}"
    objectives = " ".join(source.objectives)

    return TrainingTask(
        id=task_id,
        source_id=source.id,
        title=f"{source.title}: Engineering Decision Brief",
        domain=source.domain,
        difficulty=difficulty,
        brief=(
            f"You are the lead engineer responsible for converting this {source.source_type.lower()} into an "
            "implementable technical and delivery decision."
        ),
        scenario=f"{source.context}\n\nRequired outcomes: {objectives}",
        deliverables=[
            "A proposed architecture or system approach with key interfaces and trade-offs.",
            "A verification plan with measurable acceptance criteria.",
            "A prioritized risk register with mitigations.",
            "A phased delivery plan with owners, dependencies, and stakeholder gates.",
        ],
        constraints=source.constraints,
        estimated_minutes=75 if difficulty == "Advanced" else 50,
        skills=_select_skills(source),
        rubric=_build_rubric(),
    )


def _fallback_criterion_assessments(
    task: TrainingTask, solution: str
) -> List[CriterionAssessment]:
    normalized = solution.lower()
    depth_bonus = min(15, max(0, (len(solution.split()) - 80) // 20))
    assessments = []

    for criterion in task.rubric:
        evidence = [term for term in criterion.evidence_terms if term in normalized]
        coverage = len(evidence) / len(criterion.evidence_terms)
        score = min(100, round(30 + coverage * 55 + depth_bonus))
        if coverage >= 0.8:
            feedback = f"Strong coverage of {criterion.title.lower()} with concrete supporting evidence."
        elif coverage >= 0.4:
            feedback = f"Partial coverage of {criterion.title.lower()}; add more specific decisions and evidence."
        else:
            feedback = f"Limited evidence for {criterion.title.lower()}; address the rubric explicitly."

        assessments.append(
            CriterionAssessment(
                criterion_id=criterion.id,
                title=criterion.title,
                score=score,
                feedback=feedback,
                evidence_found=evidence,
            )
        )

    return assessments


def _extract_json(value: str) -> str:
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", value, re.DOTALL)
    if fenced:
        return fenced.group(1)
    start = value.find("{")
    end = value.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("AI response did not contain a JSON object")
    return value[start : end + 1]


def _ai_criterion_assessments(
    llm: Any, task: TrainingTask, solution: str
) -> tuple[AIEvaluationDraft, List[CriterionAssessment]]:
    rubric_json = json.dumps([criterion.model_dump() for criterion in task.rubric], indent=2)
    prompt = f"""
You are evaluating an engineering training submission. Return JSON only.

Task:
{task.model_dump_json(indent=2)}

Rubric:
{rubric_json}

Submission:
{solution}

Return this exact structure:
{{
  "summary": "evidence-based overall assessment",
  "strengths": ["specific strength"],
  "criterion_assessments": [
    {{
      "criterion_id": "one rubric criterion id",
      "score": 0,
      "feedback": "specific feedback tied to evidence",
      "evidence_found": ["short evidence phrase"]
    }}
  ],
  "next_steps": ["specific next action"]
}}

Use integer scores from 0 to 100, where 75 means benchmark proficiency.
Include exactly one assessment for every rubric criterion. Do not include markdown.
"""
    response = llm.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        content = "".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in content
        )

    draft = AIEvaluationDraft.model_validate_json(_extract_json(str(content)))
    by_id = {item.criterion_id: item for item in draft.criterion_assessments}
    if set(by_id) != {criterion.id for criterion in task.rubric}:
        raise ValueError("AI response did not assess every rubric criterion")

    raw_scores = [item.score for item in draft.criterion_assessments]
    scale = 20 if raw_scores and max(raw_scores) <= 5 else 10 if raw_scores and max(raw_scores) <= 10 else 1

    assessments = [
        CriterionAssessment(
            criterion_id=criterion.id,
            title=criterion.title,
            score=min(100, by_id[criterion.id].score * scale),
            feedback=by_id[criterion.id].feedback,
            evidence_found=by_id[criterion.id].evidence_found,
        )
        for criterion in task.rubric
    ]
    return draft, assessments


def _overall_score(
    task: TrainingTask, assessments: List[CriterionAssessment]
) -> int:
    criterion_weights = {criterion.id: criterion.weight for criterion in task.rubric}
    weighted = sum(
        assessment.score * criterion_weights[assessment.criterion_id]
        for assessment in assessments
    )
    total_weight = sum(criterion_weights.values())
    return round(weighted / total_weight)


def _skill_assessments(
    task: TrainingTask, solution: str, overall_score: int
) -> List[SkillAssessment]:
    normalized = solution.lower()
    assessments = []

    for skill in task.skills:
        terms = SKILL_EVIDENCE.get(skill.skill_id, [])
        matches = sum(term in normalized for term in terms)
        evidence_score = 40 + round((matches / max(1, len(terms))) * 60)
        score = round(overall_score * 0.75 + evidence_score * 0.25)
        assessments.append(
            SkillAssessment(
                skill_id=skill.skill_id,
                name=skill.name,
                category=skill.category,
                score=min(100, score),
                benchmark=75,
            )
        )

    return assessments


def _recommendation_for(skill: SkillAssessment) -> str:
    recommendations = {
        "Computer Science": (
            f"Strengthen {skill.name} by documenting interfaces, failure behavior, data contracts, and observability."
        ),
        "Engineering": (
            f"Strengthen {skill.name} with quantified requirements, test evidence, and explicit failure-mode controls."
        ),
        "Project Management": (
            f"Strengthen {skill.name} by adding owners, dates, dependencies, decision gates, and contingency actions."
        ),
    }
    return recommendations[skill.category]


class TrainingEngine:
    def __init__(
        self,
        llm: Optional[Any] = None,
        database_path: Optional[str | Path] = None,
        repository: Optional[SQLiteTrainingRepository] = None,
    ):
        if database_path is not None and repository is not None:
            raise ValueError("Provide either database_path or repository, not both")

        self.llm = llm
        default_database_path = (
            Path(os.environ["TRAINING_DB_PATH"])
            if os.environ.get("TRAINING_DB_PATH")
            else Path(__file__).resolve().parent / "data" / "training_engine.db"
        )
        self.repository = repository or SQLiteTrainingRepository(
            database_path or default_database_path
        )
        self._seed()

    def _seed(self) -> None:
        for index, source_data in enumerate(SEED_SOURCES, start=1):
            source = SourceCase(
                id=f"case-{index:03d}",
                collected_at=_utc_now(),
                **source_data.model_dump(),
            )
            task = generate_task(source)
            self.repository.save_source_and_task(source, task, insert_only=True)

    def list_sources(self) -> List[SourceCase]:
        return self.repository.list_sources()

    def list_tasks(self) -> List[TrainingTask]:
        return self.repository.list_tasks()

    def get_task(self, task_id: str) -> Optional[TrainingTask]:
        return self.repository.get_task(task_id)

    def collect_source(self, source_data: SourceCaseCreate) -> SourceCollectionResult:
        source = SourceCase(
            id=f"case-{uuid4().hex[:12]}",
            collected_at=_utc_now(),
            **source_data.model_dump(),
        )
        task = generate_task(source)
        self.repository.save_source_and_task(source, task)
        return SourceCollectionResult(source=source, task=task)

    def evaluate(
        self, task: TrainingTask, submission: SubmissionCreate
    ) -> EvaluationReport:
        stored_submission = StoredSubmission(
            id=f"submission-{uuid4().hex[:12]}",
            task_id=task.id,
            submitted_at=_utc_now(),
            **submission.model_dump(),
        )
        self.repository.save_submission(stored_submission)

        evaluator_mode: Literal["ai", "rubric_fallback"] = "rubric_fallback"
        ai_draft: Optional[AIEvaluationDraft] = None

        if submission.use_ai and self.llm is not None:
            try:
                ai_draft, criterion_assessments = _ai_criterion_assessments(
                    self.llm, task, submission.solution
                )
                evaluator_mode = "ai"
            except Exception as error:
                print(f"Training AI evaluation fallback for {task.id}: {error}")
                criterion_assessments = _fallback_criterion_assessments(
                    task, submission.solution
                )
        else:
            criterion_assessments = _fallback_criterion_assessments(
                task, submission.solution
            )

        overall_score = _overall_score(task, criterion_assessments)
        skill_assessments = _skill_assessments(
            task, submission.solution, overall_score
        )
        skill_gaps = [
            SkillGap(
                skill_id=skill.skill_id,
                name=skill.name,
                category=skill.category,
                score=skill.score,
                target=skill.benchmark,
                gap=skill.benchmark - skill.score,
                recommendation=_recommendation_for(skill),
            )
            for skill in skill_assessments
            if skill.score < skill.benchmark
        ]

        strengths = (
            ai_draft.strengths
            if ai_draft
            else [
                assessment.title
                for assessment in criterion_assessments
                if assessment.score >= 75
            ][:3]
        )
        if not strengths:
            strengths = ["The submission establishes a usable starting point for iteration."]

        next_steps = (
            ai_draft.next_steps
            if ai_draft
            else [gap.recommendation for gap in skill_gaps[:3]]
        )
        if not next_steps:
            next_steps = [
                "Convert the proposal into an execution-ready decision record with owners and acceptance evidence."
            ]

        report = EvaluationReport(
            submission_id=stored_submission.id,
            task_id=task.id,
            task_title=task.title,
            submitted_at=stored_submission.submitted_at,
            evaluator_mode=evaluator_mode,
            overall_score=overall_score,
            summary=(
                ai_draft.summary
                if ai_draft
                else (
                    f"The solution scored {overall_score}/100 using the structured rubric. "
                    "Review the lowest scoring criteria and skill gaps before the next attempt."
                )
            ),
            strengths=strengths,
            criterion_assessments=criterion_assessments,
            skill_assessments=skill_assessments,
            skill_gaps=skill_gaps,
            next_steps=next_steps,
        )
        self.repository.save_report(report)
        return report

    def list_reports(self) -> List[EvaluationReport]:
        return self.repository.list_reports()

    def get_submission(self, submission_id: str) -> Optional[StoredSubmission]:
        return self.repository.get_submission(submission_id)
