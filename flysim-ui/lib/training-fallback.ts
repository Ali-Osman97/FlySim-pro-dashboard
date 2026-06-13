import type { TrainingTask } from "@/lib/training-schemas"

export const fallbackTrainingTasks: TrainingTask[] = [
  {
    id: "task-case-001",
    source_id: "case-001",
    title: "Airport Baggage Control Modernization: Engineering Decision Brief",
    domain: "Systems Integration",
    difficulty: "Advanced",
    brief: "Convert this modernization project into an implementable technical and delivery decision.",
    scenario:
      "A regional airport has intermittent conveyor stoppages, duplicated PLC logic, and limited telemetry. Integrate new sensors, edge controllers, and an operations console while keeping baggage operations available.",
    deliverables: [
      "A proposed architecture with key interfaces and trade-offs.",
      "A verification plan with measurable acceptance criteria.",
      "A prioritized risk register with mitigations.",
      "A phased delivery plan with owners and stakeholder gates.",
    ],
    constraints: [
      "Maximum planned outage is four hours.",
      "Existing PLCs remain operational during phase one.",
      "Operational staff require auditable manual overrides.",
    ],
    estimated_minutes: 75,
    skills: [
      { skill_id: "eng-systems", name: "Systems Engineering", category: "Engineering", weight: 20 },
      { skill_id: "eng-validation", name: "Verification & Validation", category: "Engineering", weight: 15 },
      { skill_id: "eng-safety", name: "Safety & Risk Engineering", category: "Engineering", weight: 15 },
      { skill_id: "cs-architecture", name: "Software Architecture", category: "Computer Science", weight: 20 },
      { skill_id: "cs-reliability", name: "Reliability Engineering", category: "Computer Science", weight: 15 },
      { skill_id: "pm-planning", name: "Delivery Planning", category: "Project Management", weight: 15 },
      { skill_id: "pm-risk", name: "Risk Management", category: "Project Management", weight: 15 },
      { skill_id: "pm-stakeholders", name: "Stakeholder Communication", category: "Project Management", weight: 10 },
    ],
    rubric: [
      {
        id: "technical-design",
        title: "Technical design quality",
        description: "Coherent architecture, interfaces, and engineering trade-offs.",
        weight: 30,
        evidence_terms: ["architecture", "interface", "trade-off", "component", "integration"],
      },
      {
        id: "validation",
        title: "Verification and measurable outcomes",
        description: "Tests, acceptance criteria, metrics, and operational evidence.",
        weight: 25,
        evidence_terms: ["test", "acceptance", "metric", "validation", "monitoring"],
      },
      {
        id: "risk",
        title: "Safety and risk control",
        description: "Failure modes with mitigations and contingencies.",
        weight: 25,
        evidence_terms: ["risk", "failure", "mitigation", "safety", "contingency"],
      },
      {
        id: "delivery",
        title: "Delivery and stakeholder plan",
        description: "Phases, owners, dependencies, decisions, and communication.",
        weight: 20,
        evidence_terms: ["milestone", "owner", "dependency", "stakeholder", "rollout"],
      },
    ],
  },
  {
    id: "task-case-002",
    source_id: "case-002",
    title: "Flight Telemetry Ingestion Outage: Engineering Decision Brief",
    domain: "Software Reliability",
    difficulty: "Advanced",
    brief: "Turn a recurring telemetry incident into a resilient remediation and delivery decision.",
    scenario:
      "A telemetry service loses messages during traffic spikes. Producers retry aggressively, consumers process events out of order, and operators lack saturation alerts.",
    deliverables: [
      "A resilient target architecture and root-cause hypothesis.",
      "Measurable reliability and recovery acceptance tests.",
      "A prioritized operational risk register.",
      "A six-week remediation and rollout plan.",
    ],
    constraints: [
      "No loss of accepted events.",
      "The migration remains backward compatible.",
      "The first production release is due in six weeks.",
    ],
    estimated_minutes: 75,
    skills: [
      { skill_id: "cs-architecture", name: "Software Architecture", category: "Computer Science", weight: 20 },
      { skill_id: "cs-data", name: "Data & API Design", category: "Computer Science", weight: 15 },
      { skill_id: "cs-reliability", name: "Reliability Engineering", category: "Computer Science", weight: 15 },
      { skill_id: "eng-systems", name: "Systems Engineering", category: "Engineering", weight: 20 },
      { skill_id: "eng-validation", name: "Verification & Validation", category: "Engineering", weight: 15 },
      { skill_id: "pm-planning", name: "Delivery Planning", category: "Project Management", weight: 15 },
      { skill_id: "pm-risk", name: "Risk Management", category: "Project Management", weight: 15 },
      { skill_id: "pm-stakeholders", name: "Stakeholder Communication", category: "Project Management", weight: 10 },
    ],
    rubric: [
      {
        id: "technical-design",
        title: "Technical design quality",
        description: "Coherent architecture, interfaces, and engineering trade-offs.",
        weight: 30,
        evidence_terms: ["architecture", "interface", "trade-off", "component", "integration"],
      },
      {
        id: "validation",
        title: "Verification and measurable outcomes",
        description: "Tests, acceptance criteria, metrics, and operational evidence.",
        weight: 25,
        evidence_terms: ["test", "acceptance", "metric", "validation", "monitoring"],
      },
      {
        id: "risk",
        title: "Safety and risk control",
        description: "Failure modes with mitigations and contingencies.",
        weight: 25,
        evidence_terms: ["risk", "failure", "mitigation", "safety", "contingency"],
      },
      {
        id: "delivery",
        title: "Delivery and stakeholder plan",
        description: "Phases, owners, dependencies, decisions, and communication.",
        weight: 20,
        evidence_terms: ["milestone", "owner", "dependency", "stakeholder", "rollout"],
      },
    ],
  },
]

