import tempfile
import unittest
from pathlib import Path

from training_engine import SourceCaseCreate, SubmissionCreate, TrainingEngine


class FakeAIResponse:
    content = """
    {
      "summary": "The submission provides a complete engineering and delivery decision.",
      "strengths": ["Clear architecture"],
      "criterion_assessments": [
        {"criterion_id": "technical-design", "score": 5, "feedback": "Strong technical architecture.", "evidence_found": ["architecture"]},
        {"criterion_id": "validation", "score": 4, "feedback": "Good measurable validation plan.", "evidence_found": ["acceptance"]},
        {"criterion_id": "risk", "score": 4, "feedback": "Specific risks and mitigations.", "evidence_found": ["mitigation"]},
        {"criterion_id": "delivery", "score": 5, "feedback": "Clear delivery ownership and gates.", "evidence_found": ["owner"]}
      ],
      "next_steps": ["Capture the decisions in an implementation backlog."]
    }
    """


class FakeLLM:
    def invoke(self, _prompt):
        return FakeAIResponse()


class TrainingEngineTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_directory.name) / "training-test.db"
        self.engine = TrainingEngine(database_path=self.database_path)

    def tearDown(self):
        self.temp_directory.cleanup()

    def test_seed_sources_generate_structured_tasks(self):
        tasks = self.engine.list_tasks()

        self.assertEqual(len(tasks), 3)
        self.assertTrue(all(task.skills for task in tasks))
        self.assertTrue(all(task.rubric for task in tasks))
        self.assertEqual(sum(item.weight for item in tasks[0].rubric), 100)

    def test_collect_source_generates_a_new_task(self):
        result = self.engine.collect_source(
            SourceCaseCreate(
                title="Factory Energy Optimization",
                summary="Reduce peak power consumption without interrupting production operations.",
                domain="Industrial Energy",
                source_type="Case Study",
                context=(
                    "A factory has volatile energy demand and limited equipment-level telemetry. "
                    "The team needs a safe optimization pilot and measurable savings."
                ),
                objectives=["Define the pilot architecture", "Create acceptance criteria"],
                constraints=["Production cannot stop during the pilot"],
            )
        )

        self.assertEqual(result.task.source_id, result.source.id)
        self.assertIn(result.task.id, {task.id for task in self.engine.list_tasks()})

    def test_rubric_fallback_generates_skill_gap_report(self):
        task = self.engine.list_tasks()[0]
        report = self.engine.evaluate(
            task,
            SubmissionCreate(
                solution=(
                    "The architecture has components and interfaces with integration trade-offs. "
                    "Acceptance tests define metrics and monitoring. Failure risks include safety "
                    "mitigations and contingency actions. Delivery uses milestones, owners, "
                    "dependencies, stakeholder approval, and a phased rollout."
                ),
                use_ai=False,
            ),
        )

        self.assertEqual(report.evaluator_mode, "rubric_fallback")
        self.assertGreaterEqual(report.overall_score, 70)
        self.assertEqual(len(report.criterion_assessments), 4)
        self.assertTrue(report.skill_assessments)

    def test_ai_five_point_scores_are_normalized_to_percentages(self):
        engine = TrainingEngine(llm=FakeLLM(), database_path=self.database_path)
        task = engine.list_tasks()[0]
        report = engine.evaluate(
            task,
            SubmissionCreate(
                solution=(
                    "Architecture interfaces, validation tests, metrics, safety risk mitigations, "
                    "milestones, owners, dependencies, stakeholders, and rollout decisions."
                ),
                use_ai=True,
            ),
        )

        self.assertEqual(report.evaluator_mode, "ai")
        self.assertEqual(report.criterion_assessments[0].score, 100)
        self.assertGreaterEqual(report.overall_score, 80)

    def test_tasks_submissions_and_reports_survive_repository_reinitialization(self):
        collected = self.engine.collect_source(
            SourceCaseCreate(
                title="Persistent Factory Retrofit",
                summary="Plan a durable controls retrofit while preserving continuous factory operation.",
                domain="Industrial Controls",
                source_type="Project",
                context=(
                    "A factory needs a phased controls retrofit with new telemetry and safety evidence. "
                    "Production must continue while the system is installed and validated."
                ),
                objectives=["Define the architecture", "Plan verification and rollout"],
                constraints=["Production cannot stop"],
            )
        )
        solution = (
            "The architecture defines components, interfaces, integration trade-offs, and a monitored fallback. "
            "Acceptance tests use measurable metrics and validation evidence. Safety failure risks have mitigations "
            "and contingency actions. Delivery includes milestones, owners, dependencies, stakeholder reviews, "
            "communication, and a phased rollout decision."
        )
        report = self.engine.evaluate(
            collected.task,
            SubmissionCreate(solution=solution, use_ai=False),
        )

        restarted_engine = TrainingEngine(database_path=self.database_path)
        restored_task = restarted_engine.get_task(collected.task.id)
        restored_submission = restarted_engine.get_submission(report.submission_id)
        restored_reports = restarted_engine.list_reports()

        self.assertEqual(restored_task, collected.task)
        self.assertIsNotNone(restored_submission)
        self.assertEqual(restored_submission.solution, solution)
        self.assertEqual(restored_submission.task_id, collected.task.id)
        self.assertEqual(restored_reports[0], report)


if __name__ == "__main__":
    unittest.main()
